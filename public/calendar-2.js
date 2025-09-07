document.addEventListener('DOMContentLoaded', async () => {
  let studentId = sessionStorage.getItem('studentId') || localStorage.getItem('studentId');
  console.log('StudentId from storage:', studentId);
  if (!studentId) {
    const username = sessionStorage.getItem('username') || localStorage.getItem('username');
    console.log('Username from storage:', username);
    if (username) {
      const res = await fetch(`/api/student/profile/${username}`);
      if (res.ok) {
        const student = await res.json();
        studentId = student.id;
        sessionStorage.setItem('studentId', studentId);
        console.log('StudentId from backend:', studentId);
      }
    }
  }
  if (!studentId) {
    document.getElementById('loadingMessage').innerText = 'Δεν βρέθηκε μαθητής.';
    return;
  }
  console.log('Final studentId used for events:', studentId);
  // 1. Fetch enrollments και φτιάξε mapping subject_id -> subject_name
  async function getSubjectNameMap(studentId) {
    const res = await fetch(`/api/student/enrollments/${studentId}`);
    if (!res.ok) return {};
    const enrollments = await res.json();
    const map = {};
    enrollments.forEach(e => {
      if (e.class_id && e.class_name) map[e.class_id] = e.class_name;
    });
    return map;
  }
  // Μετά το fetch των γεγονότων:
  const res = await fetch(`/api/calendar/${studentId}`);
  let events = [];
  if (res.ok) {
    events = await res.json();
    console.log('Events fetched:', events);
    if (events.length === 0) {
      document.getElementById('noEventsMessage').style.display = 'block';
      document.getElementById('calendarContent').style.display = 'none';
    } else {
      document.getElementById('calendarContent').style.display = 'block';
      document.getElementById('noEventsMessage').style.display = 'none';
      // Διαχωρισμός προσεχών και παλαιότερων
      const now = new Date();
      function dateOnly(d) {
        // Αν είναι Date object
        if (d instanceof Date) return new Date(d.getFullYear(), d.getMonth(), d.getDate());
        // Αν είναι ISO string
        const dateObj = new Date(d);
        return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
      }
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const upcoming = events.filter(ev => dateOnly(ev.event_date) >= today);
      const past = events.filter(ev => dateOnly(ev.event_date) < today);
      console.log('Upcoming events:', upcoming);
      console.log('Past events:', past);
      // Αφαίρεση debug JSON block
      // Βελτιωμένο rendering για όλα τα γεγονότα
      // Αντιστοίχιση subject_id -> όνομα μαθήματος
      const subjectMap = await getSubjectNameMap(studentId);
      function renderEvent(ev) {
        // Εμφάνιση όλων των πιθανών πεδίων για μάθημα και τάξη
        let subject = ev.subject_name || ev.subject || ev.lesson;
        if (!subject && ev.subject_id && subjectMap[ev.subject_id]) subject = subjectMap[ev.subject_id];
        if (!subject) subject = '-';
        // Αν το subject περιέχει '-', πάρε μόνο το μέρος μετά το '-'
        if (subject.includes('-')) subject = subject.split('-')[1].trim();
        const className = ev.class_name || ev.class || ev.student_class || ev.target_class || ev.grade || ev.classid || '';
        // Fallback για όλα τα πεδία
        const title = ev.event_title || ev.event_type || ev.event_text || 'Γεγονός';
        const type = ev.event_type || ev.event_title || 'Τύπος';
        const date = ev.event_date ? (ev.event_date.split('T')[0] || ev.event_date) : '-';
        const time = ev.event_time || '';
        const text = ev.event_text || '';
        // Badge χρώματος ανά τύπο
        let badgeColor = '#dc3545';
        if (type.includes('Διαγώνισμα')) badgeColor = '#ffc107';
        if (type.includes('Αναπλήρωση')) badgeColor = '#dc3545';
        if (type.includes('meeting')) badgeColor = '#007bff';
        if (type.includes('extra_class')) badgeColor = '#28a745';
        // DEBUG: Εμφάνιση όλων των πεδίων του event για troubleshooting
        return  `<div style=\"background:#fff; margin-bottom:15px; padding:15px; border-radius:20px; box-shadow:0 2px 4px rgba(0,0,0,0.1); display:flex; flex-direction:column;\">` +
          `<div style=\"display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;\">` +
            `<div style=\"font-weight:bold; color:#333; font-size:1.1em;\">${title}</div>` +
            `<div style=\"color:#666; font-size:14px;\">${date}${time ? ' ' + time : ''}</div>` +
          `</div>` +
          `<div style=\"display:flex; align-items:center; gap:10px; margin-bottom:8px;\">` +
            `<span style=\"background:${badgeColor}; color:white; padding:2px 10px; border-radius:12px; font-size:13px; font-weight:bold;\">${type}</span>` +
            `<span style=\"color:#666; font-size:14px;\">Μάθημα: ${subject}</span>` +
            (className ? `<span style='color:#666; font-size:14px;'>Τάξη: ${className}</span>` : '') +
          `</div>` +
          (text ? `<div style='color:#555; font-size:14px; margin-top:6px;'>${text}</div>` : '') +
        `</div>`;
      }
      document.getElementById('upcomingEventsList').innerHTML = upcoming.length > 0 ? upcoming.map(renderEvent).join('') : '<div>Δεν υπάρχουν προσεχή γεγονότα.</div>';
      document.getElementById('pastEventsList').innerHTML = past.length > 0 ? past.map(renderEvent).join('') : '<div>Δεν υπάρχουν παλαιότερα γεγονότα.</div>';
      // Populate filters
      function populateFilters(calendarEntries, subjectMap) {
        const eventTypeFilter = document.getElementById('eventTypeFilter');
        const subjectFilter = document.getElementById('subjectFilter');
        // Event types
        const eventTypes = [...new Set(calendarEntries.map(entry => entry.event_type).filter(Boolean))];
        eventTypeFilter.innerHTML = '';
        const firstEventOption = document.createElement('option');
        firstEventOption.value = '';
        firstEventOption.textContent = 'Όλα τα γεγονότα';
        eventTypeFilter.appendChild(firstEventOption);
        eventTypes.forEach(type => {
          const option = document.createElement('option');
          option.value = type;
          option.textContent = type;
          eventTypeFilter.appendChild(option);
        });
        // Μαθήματα μόνο για τα οποία υπάρχουν γεγονότα και είναι εγγεγραμμένος ο μαθητής
        const subjectsWithEvents = [...new Set(calendarEntries.map(ev => {
          let subject = ev.subject_name || ev.subject || ev.lesson;
          if (!subject && ev.subject_id && subjectMap[ev.subject_id]) subject = subjectMap[ev.subject_id];
          if (!subject) subject = '-';
          if (subject.includes('-')) subject = subject.split('-')[1].trim();
          return subject;
        }).filter(s => s && s !== '-'))];
        subjectFilter.innerHTML = '';
        const firstSubjectOption = document.createElement('option');
        firstSubjectOption.value = '';
        firstSubjectOption.textContent = 'Όλα τα μαθήματα';
        subjectFilter.appendChild(firstSubjectOption);
        subjectsWithEvents.forEach(subject => {
          const option = document.createElement('option');
          option.value = subject;
          option.textContent = subject;
          subjectFilter.appendChild(option);
        });
        // Event listeners όπως πριν
      }
      // Στο rendering, κάλεσε populateFilters(calendarEntries, subjectMap)
      populateFilters(events, subjectMap);
      // Ενημέρωση φίλτρων ώστε να φιλτράρουν σωστά τα γεγονότα με βάση το μάθημα
      function filterEntries(allEntries, subjectMap) {
        const eventTypeFilter = document.getElementById('eventTypeFilter').value;
        const subjectFilter = document.getElementById('subjectFilter').value;
        let filteredEntries = allEntries;
        if (eventTypeFilter) {
          filteredEntries = filteredEntries.filter(entry => entry.event_type === eventTypeFilter);
        }
        if (subjectFilter) {
          filteredEntries = filteredEntries.filter(ev => {
            let subject = ev.subject_name || ev.subject || ev.lesson;
            if (!subject && ev.subject_id && subjectMap[ev.subject_id]) subject = subjectMap[ev.subject_id];
            if (!subject) subject = '-';
            if (subject.includes('-')) subject = subject.split('-')[1].trim();
            return subject === subjectFilter;
          });
        }
        // Διαχωρισμός προσεχών και παλαιότερων μετά το filtering
        const now = new Date();
        function dateOnly(d) {
          if (d instanceof Date) return new Date(d.getFullYear(), d.getMonth(), d.getDate());
          const dateObj = new Date(d);
          return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        }
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const upcoming = filteredEntries.filter(ev => dateOnly(ev.event_date) >= today);
        const past = filteredEntries.filter(ev => dateOnly(ev.event_date) < today);
        document.getElementById('upcomingEventsList').innerHTML = upcoming.length > 0 ? upcoming.map(renderEvent).join('') : '<div>Δεν υπάρχουν προσεχή γεγονότα.</div>';
        document.getElementById('pastEventsList').innerHTML = past.length > 0 ? past.map(renderEvent).join('') : '<div>Δεν υπάρχουν παλαιότερα γεγονότα.</div>';
      }
      eventTypeFilter.addEventListener('change', () => filterEntries(events, subjectMap));
      subjectFilter.addEventListener('change', () => filterEntries(events, subjectMap));
    }
  } else {
    const loadingMsg = document.getElementById('loadingMessage');
    if (loadingMsg) loadingMsg.innerText = 'Σφάλμα φόρτωσης γεγονότων.';
  }
});

  // Comprehensive force καφέ χρώματα στα dropdown για calendar
  document.addEventListener('DOMContentLoaded', function() {
    const selects = document.querySelectorAll('#eventTypeFilter, #subjectFilter');
    
    // CSS injection για override browser defaults
    const style = document.createElement('style');
    style.textContent = `
      select, select:focus, select:hover, select:active {
        accent-color: #A0522D !important;
        color-scheme: light !important;
      }
      
      select option {
        background-color: white !important;
        color: #333 !important;
      }
      
      select option:hover,
      select option:focus,
      select option:checked,
      select option:active,
      select option[selected] {
        background-color: #A0522D !important;
        background: #A0522D !important;
        color: white !important;
      }
      
      /* Browser-specific overrides */
      select::-webkit-calendar-picker-indicator {
        filter: invert(31%) sepia(45%) saturate(1000%) hue-rotate(180deg) !important;
      }
      
      select::-moz-list-bullet {
        color: #A0522D !important;
      }
    `;
    document.head.appendChild(style);
    
    selects.forEach(select => {
      // Override inline styles
      select.style.setProperty('accent-color', '#A0522D', 'important');
      select.style.setProperty('color-scheme', 'light', 'important');
      
      // Force καφέ σε όλα τα options
      const options = select.querySelectorAll('option');
      options.forEach(option => {
        option.style.setProperty('background-color', 'white', 'important');
        option.style.setProperty('color', '#333', 'important');
        
        // Event listeners για τα options
        option.addEventListener('mouseover', function() {
          this.style.setProperty('background-color', '#A0522D', 'important');
          this.style.setProperty('color', 'white', 'important');
        });
        
        option.addEventListener('mouseout', function() {
          if (!this.selected) {
            this.style.setProperty('background-color', 'white', 'important');
            this.style.setProperty('color', '#333', 'important');
          }
        });
      });
      
      // Add event listeners για καφέ highlights στο select element
      select.addEventListener('focus', function() {
        this.style.setProperty('border-color', '#A0522D', 'important');
        this.style.setProperty('box-shadow', '0 0 0 3px rgba(160,82,45,0.1)', 'important');
      });
      
      select.addEventListener('blur', function() {
        this.style.setProperty('border-color', '#e1e5e9', 'important');
        this.style.setProperty('box-shadow', 'none', 'important');
      });
      
      select.addEventListener('mouseover', function() {
        this.style.setProperty('border-color', '#A0522D', 'important');
        this.style.setProperty('transform', 'translateY(-2px)', 'important');
        this.style.setProperty('box-shadow', '0 4px 12px rgba(160,82,45,0.15)', 'important');
      });
      
      select.addEventListener('mouseout', function() {
        if (document.activeElement !== this) {
          this.style.setProperty('border-color', '#e1e5e9', 'important');
          this.style.setProperty('transform', 'translateY(0)', 'important');
          this.style.setProperty('box-shadow', 'none', 'important');
        }
      });
      
      // Override οποιαδήποτε browser default highlighting
      select.addEventListener('change', function() {
        this.style.setProperty('accent-color', '#A0522D', 'important');
      });
    });
    
    // MutationObserver για νέα options που προστίθενται δυναμικά
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(function(node) {
            if (node.tagName === 'OPTION') {
              node.style.setProperty('background-color', 'white', 'important');
              node.style.setProperty('color', '#333', 'important');
            }
          });
        }
      });
    });
    
    selects.forEach(select => {
      observer.observe(select, { childList: true });
    });
  });
