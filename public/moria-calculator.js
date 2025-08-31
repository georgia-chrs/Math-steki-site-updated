// Δυναμικός Υπολογιστής Μορίων και Σχολών
class MoriaCalculator {
    constructor() {
        this.data = {
            lykeio: '',
            pedio: '',
            vathmoi: {},
            eidika: []
        };
        this.scholesData = null;
        this.systemConfig = null;
    }

    // Φόρτωση ρυθμίσεων συστήματος
    async loadSystemConfig() {
        try {
            const response = await fetch('../data/system-config.json');
            if (!response.ok) {
                throw new Error('Σφάλμα φόρτωσης ρυθμίσεων συστήματος');
            }
            this.systemConfig = await response.json();
            return this.systemConfig;
        } catch (error) {
            console.error('Σφάλμα:', error);
            return null;
        }
    }

    // Λήψη διαθέσιμων πεδίων για συγκεκριμένο λύκειο
    getAvailablePedia(lykeioId) {
        if (!this.systemConfig) return [];
        
        const lykeio = this.systemConfig.lykeiaTypes.find(l => l.id === lykeioId);
        if (!lykeio) return [];
        
        return lykeio.pedia.map(pedioId => ({
            id: pedioId,
            name: this.systemConfig.pedia[pedioId]?.name || pedioId
        }));
    }

    // Λήψη μαθημάτων για συγκεκριμένο πεδίο
    getMathimataForPedio(pedioId) {
        if (!this.systemConfig || !this.systemConfig.pedia[pedioId]) return [];
        
        return this.systemConfig.pedia[pedioId].mathimata;
    }

    // Λήψη ειδικών μαθημάτων για συγκεκριμένο πεδίο
    getEidikaMathimataForPedio(pedioId) {
        if (!this.systemConfig || !this.systemConfig.pedia[pedioId]) return [];
        
        return this.systemConfig.pedia[pedioId].eidikaMathimata;
    }

    // Φόρτωση δεδομένων σχολών βάσει πεδίου από το κύριο αρχείο
    async loadScholesData(pedioId) {
        try {
            if (!this.systemConfig || !this.systemConfig.pedia[pedioId]) {
                throw new Error('Άγνωστο πεδίο');
            }

            const pedioConfig = this.systemConfig.pedia[pedioId];
            
            // Πρώτα προσπαθούμε να φορτώσουμε από το ξεχωριστό αρχείο
            try {
                const fileName = pedioConfig.dataFile;
                const response = await fetch(`./data/${fileName}`);
                if (response.ok) {
                    this.scholesData = await response.json();
                    console.log(`✅ Loaded data from ${fileName}:`, this.scholesData.scholes?.length || 0, 'schools');
                    return this.scholesData;
                }
            } catch (separateFileError) {
                console.log(`📄 Separate file not available, using main database...`);
            }

            // Αν το ξεχωριστό αρχείο δεν υπάρχει, χρησιμοποιούμε το κύριο αρχείο
            const response = await fetch('./data/schools-data.json');
            if (!response.ok) {
                throw new Error('Σφάλμα φόρτωσης κύριου αρχείου δεδομένων');
            }
            
            const allSchools = await response.json();
            console.log(`📚 Loaded main database:`, allSchools.length, 'total schools');
            
            // Φιλτράρισμα σχολών βάσει επιστημονικού πεδίου
            const filteredSchools = allSchools.filter(school => {
                // Έλεγχος με το scientificFieldCode (1, 2, 3, 4)
                if (school.scientificField === pedioConfig.scientificFieldCode) {
                    return true;
                }
                // Έλεγχος με το παλιό field code (theoretiko, thetiko, κλπ)
                if (school.field === pedioConfig.oldFieldCode) {
                    return true;
                }
                return false;
            });

            console.log(`🎯 Filtered schools for ${pedioId}:`, filteredSchools.length, 'schools');

            // Μετατροπή στη δομή που περιμένει ο υπολογιστής
            this.scholesData = {
                scholes: filteredSchools.map(school => ({
                    name: school.name,
                    vasi: school.minMoria || school.maxMoria || 15000,
                    mathimata: pedioConfig.mathimata.map(m => m.name),
                    syntelesties: this.getDefaultSyntelesties(pedioId),
                    eidika: pedioConfig.eidikaMathimata || [],
                    pedio: pedioConfig.name,
                    university: school.university,
                    city: school.city,
                    id: school.id
                }))
            };

            return this.scholesData;
        } catch (error) {
            console.error('Σφάλμα φόρτωσης δεδομένων σχολών:', error);
            return null;
        }
    }

    // Προκαθορισμένοι συντελεστές ανά πεδίο
    getDefaultSyntelesties(pedioId) {
        const defaultSyntelesties = {
            'pedio1': [0.3, 0.3, 0.2, 0.2], // Γλώσσα, Αρχαία, Ιστορία, Λατινικά
            'pedio2': [0.2, 0.4, 0.3, 0.1], // Γλώσσα, Μαθηματικά, Φυσική, Χημεία
            'pedio3': [0.2, 0.4, 0.3, 0.1], // Γλώσσα, Βιολογία, Χημεία, Φυσική
            'pedio4': [0.2, 0.3, 0.4, 0.1]  // Γλώσσα, Μαθηματικά, Οικονομία, Πληροφορική
        };
        return defaultSyntelesties[pedioId] || [0.25, 0.25, 0.25, 0.25];
    }

    // Υπολογισμός μορίων για μια σχολή
    // Φόρμουλα: Μόρια = [Συντ.1] * [Β1] + [Συντ.2] * [Β2] + [Συντ.3] * [Β3] + [Συντ.4] * [Β4]
    // όπου οι συντελεστές είναι 0.2 - 0.4 και το άθροισμά τους = 1
    calculateMoria(scholi, vathmoi, eidika) {
        let totalMoria = 0;
        let totalSyntelestis = 0;

        // Έλεγχος ότι η σχολή έχει τα απαραίτητα στοιχεία
        if (!scholi.mathimata || !scholi.syntelesties || 
            scholi.mathimata.length !== scholi.syntelesties.length) {
            console.error('Σφάλμα στα δεδομένα σχολής:', scholi.name);
            return 0;
        }

        // Υπολογισμός κύριων μαθημάτων με τον επίσημο τύπο
        scholi.mathimata.forEach((mathima, index) => {
            const vathmosKey = this.getMathimaKey(mathima);
            const vathmos = parseFloat(vathmoi[vathmosKey]) || 0;
            const syntelestis = parseFloat(scholi.syntelesties[index]) || 0;
            
            // Έλεγχος ότι ο συντελεστής είναι στο επιτρεπτό εύρος (0.2 - 0.4)
            if (syntelestis < 0.2 || syntelestis > 0.4) {
                console.warn(`Μη έγκυρος συντελεστής για ${mathima}: ${syntelestis}`);
            }
            
            const moiriaFromMathima = vathmos * syntelestis * 100;
            totalMoria += moiriaFromMathima;
            totalSyntelestis += syntelestis;
            
            // Debug info
            console.log(`${mathima}: ${vathmos} × ${syntelestis} × 100 = ${moiriaFromMathima}`);
        });

        // Έλεγχος ότι το άθροισμα των συντελεστών είναι 1
        if (Math.abs(totalSyntelestis - 1.0) > 0.01) {
            console.warn(`Το άθροισμα των συντελεστών δεν είναι 1: ${totalSyntelestis} για σχολή ${scholi.name}`);
        }

        // Προσθήκη ειδικών μαθημάτων (συνήθως 10% συντελεστής)
        if (eidika && eidika.length > 0) {
            eidika.forEach(eidiko => {
                if (eidiko.mathima && eidiko.vathmos && 
                    scholi.eidika && scholi.eidika.includes(eidiko.mathima)) {
                    const eidikaMoria = parseFloat(eidiko.vathmos) * 0.1 * 100;
                    totalMoria += eidikaMoria;
                    console.log(`Ειδικό μάθημα ${eidiko.mathima}: ${eidiko.vathmos} × 0.1 × 100 = ${eidikaMoria}`);
                }
            });
        }

        return Math.round(totalMoria);
    }

    // Μετατροπή ονόματος μαθήματος σε κλειδί
    getMathimaKey(mathima) {
        const mapping = {
            'Νεοελληνική Γλώσσα - Έκθεση & Λογοτεχνία': 'glossa',
            'Νεοελληνική Γλώσσα': 'glossa',
            'Αρχαία Προσανατολισμού': 'archaia',
            'Αρχαία Ελληνικά': 'archaia',
            'Ιστορία Προσανατολισμού': 'istoria',
            'Ιστορία': 'istoria',
            'Λατινικά': 'latina',
            'Μαθηματικά': 'mathimatika',
            'Φυσική': 'fysiki',
            'Χημεία': 'chimeia',
            'Βιολογία': 'viologia',
            'Στατιστική': 'statistiki',
            'Οικονομία': 'oikonomia',
            'Οικονομικά': 'oikonomika',
            'Πληροφορική': 'plirofiriki',
            'Τεχνολογία': 'technologia',
            'Ειδικότητα': 'eidikotita',
            'Διοίκηση': 'dioikisi',
            'Λογιστικά': 'logistika',
            'Γεωγραφία': 'geografia',
            'Ξένες Γλώσσες': 'xenes_glosses',
            'Μηχανολογία': 'michanologia',
            'Ηλεκτρολογία': 'ilektrologika',
            'Αυτοματισμοί': 'automatismoi'
        };
        return mapping[mathima] || mathima.toLowerCase().replace(/\s+/g, '_');
    }

    // Εύρεση κατάλληλων σχολών
    findSuitableScholes(vathmoi, eidika) {
        if (!this.scholesData) return [];

        const results = [];
        
        this.scholesData.scholes.forEach(scholi => {
            const moria = this.calculateMoria(scholi, vathmoi, eidika);
            
            if (moria >= scholi.vasi) {
                results.push({
                    ...scholi,
                    calculatedMoria: moria,
                    difference: moria - scholi.vasi
                });
            }
        });

        // Ταξινόμηση κατά φθίνουσα σειρά βάσης
        return results.sort((a, b) => b.vasi - a.vasi);
    }

    // Εμφάνιση αποτελεσμάτων στο βήμα 5
    displayResults(vathmoi, eidika) {
        const suitableScholes = this.findSuitableScholes(vathmoi, eidika);
        const resultsContainer = document.querySelector('#step5-results');
        const excelContainer = document.querySelector('#excel-export-container');
        
        if (!resultsContainer) {
            console.error('Δεν βρέθηκε το container των αποτελεσμάτων');
            return;
        }

        if (suitableScholes.length === 0) {
            resultsContainer.innerHTML = `
                <div class="no-results">
                    <h3>Δυστυχώς δεν βρέθηκαν κατάλληλες σχολές</h3>
                    <p>Προσπαθήστε να βελτιώσετε τους βαθμούς σας ή να προσθέσετε ειδικά μαθήματα.</p>
                </div>
            `;
            // Απόκρυψη του Excel export button
            if (excelContainer) {
                excelContainer.style.display = 'none';
            }
            return;
        }

        // Αποθήκευση αποτελεσμάτων για Excel export
        this.lastResults = {
            vathmoi: vathmoi,
            eidika: eidika,
            suitableScholes: suitableScholes
        };

        let html = `
            <div class="results-header">
                <h3>Κατάλληλες Σχολές για εσάς:</h3>
                <p>Βρέθηκαν ${suitableScholes.length} σχολές που μπορείτε να περάσετε!</p>
            </div>
            <div class="scholes-list">
        `;

        suitableScholes.forEach((scholi, index) => {
            html += `
                <div class="scholi-item ${index < 3 ? 'top-choice' : ''}">
                    <div class="scholi-header">
                        <h4>${scholi.name}</h4>
                        <span class="rank">#${index + 1}</span>
                    </div>
                    <div class="scholi-details">
                        <div class="moria-info">
                            <span class="label">Τα μόρια σας:</span>
                            <span class="value">${scholi.calculatedMoria.toLocaleString()}</span>
                        </div>
                        <div class="vasi-info">
                            <span class="label">Βάση σχολής:</span>
                            <span class="value">${scholi.vasi.toLocaleString()}</span>
                        </div>
                        <div class="difference-info">
                            <span class="label">Διαφορά:</span>
                            <span class="value positive">+${scholi.difference.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        html += '</div>';
        resultsContainer.innerHTML = html;

        // Εμφάνιση του Excel export button
        if (excelContainer) {
            excelContainer.style.display = 'block';
            
            // Προσθήκη event listener αν δεν υπάρχει
            const exportBtn = document.getElementById('export-excel-btn');
            if (exportBtn && !exportBtn.hasAttribute('data-listener-added')) {
                exportBtn.addEventListener('click', () => this.exportToExcel());
                exportBtn.setAttribute('data-listener-added', 'true');
            }
        }
    }

    // Export αποτελεσμάτων ως Excel
    exportToExcel() {
        try {
            console.log('Έναρξη Excel export...');
            
            if (!window.XLSX) {
                alert('Η βιβλιοθήκη XLSX δεν έχει φορτωθεί. Παρακαλώ ανανεώστε τη σελίδα και δοκιμάστε ξανά.');
                return;
            }

            if (!this.lastResults || !this.lastResults.suitableScholes) {
                alert('Δεν υπάρχουν αποτελέσματα για export.');
                return;
            }

            const { vathmoi, eidika, suitableScholes } = this.lastResults;

            // Δημιουργία δεδομένων για Excel
            const excelData = [];
            
            // Header
            excelData.push([
                'Κατάταξη',
                'Όνομα Σχολής',
                'Τα Μόρια Σας',
                'Βάση Σχολής',
                'Διαφορά',
                'Ποσοστό Υπέρβασης (%)'
            ]);

            // Δεδομένα σχολών
            suitableScholes.forEach((scholi, index) => {
                const pososto = ((scholi.difference / scholi.vasi) * 100).toFixed(2);
                excelData.push([
                    index + 1,
                    scholi.name,
                    scholi.calculatedMoria,
                    scholi.vasi,
                    scholi.difference,
                    pososto
                ]);
            });

            // Προσθήκη κενής γραμμής και στοιχείων χρήστη
            excelData.push([]);
            excelData.push(['ΣΤΟΙΧΕΙΑ ΧΡΗΣΤΗ']);
            excelData.push([]);
            
            // Βαθμοί
            excelData.push(['ΒΑΘΜΟΙ ΜΑΘΗΜΑΤΩΝ']);
            Object.entries(vathmoi).forEach(([mathima, vathmos]) => {
                excelData.push([mathima, vathmos]);
            });

            // Ειδικά μαθήματα
            if (eidika && eidika.length > 0) {
                excelData.push([]);
                excelData.push(['ΕΙΔΙΚΑ ΜΑΘΗΜΑΤΑ']);
                eidika.forEach(eidiko => {
                    excelData.push([eidiko.mathima, eidiko.vathmos]);
                });
            }

            // Δημιουργία workbook
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(excelData);

            // Formatting του worksheet
            const range = XLSX.utils.decode_range(ws['!ref']);
            
            // Styling για headers
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const address = XLSX.utils.encode_cell({ r: 0, c: C });
                if (!ws[address]) continue;
                ws[address].s = {
                    font: { bold: true },
                    fill: { fgColor: { rgb: "5b3c2a" } },
                    alignment: { horizontal: "center" }
                };
            }

            // Προσθήκη του worksheet στο workbook
            XLSX.utils.book_append_sheet(wb, ws, "Αποτελέσματα Μορίων");

            // Δημιουργία filename με timestamp
            const now = new Date();
            const timestamp = now.toISOString().slice(0, 19).replace(/[:-]/g, '');
            const filename = `Αποτελεσματα_Μοριων_${timestamp}.xlsx`;

            console.log('Δημιουργία Excel αρχείου:', filename);

            // Export του αρχείου
            XLSX.writeFile(wb, filename);

            console.log('Excel export ολοκληρώθηκε επιτυχώς');

        } catch (error) {
            console.error('Σφάλμα κατά το Excel export:', error);
            alert('Σφάλμα κατά το export. Παρακαλώ δοκιμάστε ξανά.');
        }
    }

    // Λήψη πληροφοριών για επιστημονικό πεδίο
    getPedioInfo(pedioId) {
        if (!this.systemConfig || !this.systemConfig.pedia[pedioId]) return null;
        
        const pedio = this.systemConfig.pedia[pedioId];
        return {
            id: pedioId,
            name: pedio.name,
            description: pedio.description || '',
            omadaProsan: pedio.omadaProsan || '',
            mathimata: pedio.mathimata,
            eidikaMathimata: pedio.eidikaMathimata
        };
    }

    // Εμφάνιση πληροφοριών για τα 4 επιστημονικά πεδία
    displayPediaInfo() {
        const pediaInfo = [
            {
                id: 'pedio1',
                title: '1ο Πεδίο: Ανθρωπιστικών, Νομικών και Κοινωνικών Σπουδών',
                schools: 'Νομικής, Φιλολογίας, Ιστορίας-Αρχαιολογίας, Ψυχολογίας, Θεολογίας, Ξένων Γλωσσών, Κοινωνιολογίας, Πολιτικών Επιστημών, Δημόσιας Διοίκησης, Επικοινωνίας & Μέσων Μαζικής Ενημέρωσης, Θεάτρου κ.λπ.',
                omada: 'Ανθρωπιστικών Σπουδών',
                mathimata: ['Νεοελληνική Γλώσσα - Έκθεση & Λογοτεχνία', 'Αρχαία Προσανατολισμού', 'Ιστορία Προσανατολισμού', 'Λατινικά']
            },
            {
                id: 'pedio2',
                title: '2ο Πεδίο: Τεχνολογικών και Θετικών Σπουδών',
                schools: 'Ηλεκτρολόγων Μηχανικών & Μηχανικών Ηλεκτρονικών Υπολογιστών, Μηχανολόγων και Ναυπηγών Μηχανικών, Πολιτικών, Τοπογράφων και Αρχιτεκτόνων Μηχανικών Χημικών Μηχανικών, Επιστήμης Υλικών κ.λπ. καθώς και Μαθηματικών, Φυσικής, Πληροφορικής, Χημείας, Γεωπονίας κ.λπ.',
                omada: 'Θετικών Επιστημών',
                mathimata: ['Νεοελληνική Γλώσσα - Έκθεση & Λογοτεχνία', 'Μαθηματικά', 'Φυσική', 'Χημεία']
            },
            {
                id: 'pedio3',
                title: '3ο Πεδίο: Σπουδών Υγείας και Ζωής',
                schools: 'Ιατρικής, Φαρμακευτικής, Βιολογίας, Νοσηλευτικής, Γεωπονίας, Επιστήμης Τροφίμων, Διατροφολογίας, Παραϊατρικών Επαγγελμάτων κ.λπ.',
                omada: 'Θετικών Επιστημών',
                mathimata: ['Νεοελληνική Γλώσσα - Έκθεση & Λογοτεχνία', 'Βιολογία', 'Χημεία', 'Φυσική']
            },
            {
                id: 'pedio4',
                title: '4ο Πεδίο: Σπουδών Οικονομίας και Πληροφορικής',
                schools: 'Οικονομικές, Χρηματοοικονομικές, Οργάνωσης & Διοίκησης Επιχειρήσεων, Λογιστικής κ.λπ. καθώς και Πληροφορικής, Μηχανικών Πληροφορικής και Τηλεπικοινωνιών κ.α.',
                omada: 'Σπουδών Οικονομίας και Πληροφορικής',
                mathimata: ['Νεοελληνική Γλώσσα - Έκθεση & Λογοτεχνία', 'Μαθηματικά', 'Οικονομία', 'Πληροφορική']
            }
        ];

        return pediaInfo;
    }

    // Φόρτωση πληροφοριών επιστημονικών πεδίων
    async loadPediaInfo() {
        try {
            const response = await fetch('../data/pedia-info.json');
            if (!response.ok) {
                throw new Error('Σφάλμα φόρτωσης πληροφοριών πεδίων');
            }
            return await response.json();
        } catch (error) {
            console.error('Σφάλμα:', error);
            return null;
        }
    }

    // Εμφάνιση πληροφοριών επιστημονικών πεδίων σε HTML
    async displayPediaInfoHTML() {
        const pediaInfo = await this.loadPediaInfo();
        if (!pediaInfo) return '';

        let html = `
            <div class="pedia-info-container">
                <h2>${pediaInfo.title}</h2>
                <p class="description">${pediaInfo.description}</p>
                
                <div class="pedia-grid">
        `;

        pediaInfo.pedia.forEach(pedio => {
            html += `
                <div class="pedio-card">
                    <h3>${pedio.number} Πεδίο: ${pedio.title}</h3>
                    <div class="pedio-details">
                        <h4>Σχολές (Ενδεικτικά):</h4>
                        <ul class="schools-list">
                            ${pedio.schools.map(school => `<li>${school}</li>`).join('')}
                        </ul>
                        
                        <h4>Μηχανογραφικό:</h4>
                        <p class="machografiko">${pedio.machografiko} - ${pedio.omadaProsan}</p>
                        
                        <h4>Πανελλαδικά Εξεταζόμενα Μαθήματα:</h4>
                        <ul class="mathimata-list">
                            ${pedio.mathimata.map(mathima => `<li>${mathima}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            `;
        });

        html += `
                </div>
                
                <div class="syntelestes-info">
                    <h3>${pediaInfo.syntelestes.title}</h3>
                    <div class="formula">
                        <strong>Γενικός Τύπος:</strong>
                        <p class="formula-text">${pediaInfo.syntelestes.formula}</p>
                    </div>
                    <p class="explanation">${pediaInfo.syntelestes.explanation}</p>
                    
                    <h4>Κανόνες Συντελεστών:</h4>
                    <ul class="rules-list">
                        ${pediaInfo.syntelestes.rules.map(rule => `<li>${rule}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        return html;
    }

    // Εξήγηση συντελεστών βαρύτητας
    explainSyntelestes() {
        return {
            title: 'Συντελεστές Βαρύτητας στον Υπολογισμό Μορίων',
            formula: 'Μόρια Εισαγωγής Τμήματος = [Συντ.1] * [Β1] + [Συντ.2] * [Β2] + [Συντ.3] * [Β3] + [Συντ.4] * [Β4]',
            explanation: 'όπου Β1, Β2, Β3 και Β4 οι βαθμοί του υποψηφίου στα τέσσερα μαθήματα και Συντ.1, Συντ.2, Συντ.3 και Συντ.4 οι αντίστοιχοι συντελεστές που έχει καθορίσει το συγκεκριμένο Πανεπιστημιακό Τμήμα.',
            rules: [
                'Οι συντελεστές είναι τουλάχιστον 0,2 και το πολύ 0,4',
                'Το άθροισμα των συντελεστών ισούται με 1',
                'Ο βαθμός κάθε μαθήματος συνυπολογίζεται τουλάχιστον 20% και το πολύ 40% στο σύνολο των μορίων',
                'Κάθε υποψήφιος συγκεντρώνει διαφορετικό σύνολο μορίων για τα διάφορα Πανεπιστημιακά Τμήματα του Επιστημονικού του Πεδίου'
            ]
        };
    }

    // Δημιουργία tooltip με πληροφορίες πεδίου
    createPedioTooltip(pedioId, element) {
        const pedioInfo = this.getPedioInfo(pedioId);
        if (!pedioInfo) return;

        const tooltip = document.createElement('div');
        tooltip.className = 'pedio-tooltip';
        tooltip.innerHTML = `
            <h4>${pedioInfo.name}</h4>
            <p><strong>Μαθήματα:</strong></p>
            <ul>
                ${pedioInfo.mathimata.map(m => `<li>${m.name}</li>`).join('')}
            </ul>
            <p><strong>Περιγραφή:</strong> ${pedioInfo.description}</p>
        `;

        element.appendChild(tooltip);
        return tooltip;
    }

    // Validation των συντελεστών σχολής
    validateSyntelesties(syntelesties) {
        if (!Array.isArray(syntelesties) || syntelesties.length !== 4) {
            return { valid: false, error: 'Πρέπει να υπάρχουν ακριβώς 4 συντελεστές' };
        }

        const sum = syntelesties.reduce((a, b) => a + b, 0);
        if (Math.abs(sum - 1.0) > 0.01) {
            return { valid: false, error: `Το άθροισμα των συντελεστών πρέπει να είναι 1.0 (βρέθηκε: ${sum})` };
        }

        for (let i = 0; i < syntelesties.length; i++) {
            if (syntelesties[i] < 0.2 || syntelesties[i] > 0.4) {
                return { valid: false, error: `Συντελεστής ${i + 1} πρέπει να είναι μεταξύ 0.2 και 0.4 (βρέθηκε: ${syntelesties[i]})` };
            }
        }

        return { valid: true };
    }
}

// Δημιουργία instance του calculator
const moriaCalculator = new MoriaCalculator();

// Export για χρήση σε άλλα αρχεία
window.MoriaCalculator = MoriaCalculator;
window.moriaCalculator = moriaCalculator;
