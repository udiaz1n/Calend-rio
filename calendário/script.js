const monthYear = document.getElementById('monthYear');
const daysContainer = document.getElementById('days');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const eventForm = document.getElementById('eventForm');
const eventTitleInput = document.getElementById('eventTitle');
const eventGuestsInput = document.getElementById('eventGuests');
const eventDateInput = document.getElementById('eventDate');
const startTimeInput = document.getElementById('startTime');
const endTimeInput = document.getElementById('endTime');
const eventDescriptionInput = document.getElementById('eventDescription');
const saveEventBtn = document.getElementById('saveEvent');
const cancelEventBtn = document.getElementById('cancelEvent');
const eventDetails = document.getElementById('eventDetails');
const detailsTitle = document.getElementById('detailsTitle');
const detailsDateTime = document.getElementById('detailsDateTime');
const detailsGuests = document.getElementById('detailsGuests');
const detailsDescription = document.getElementById('detailsDescription');
const closeDetails = document.getElementById('closeDetails');
const deleteEventBtn = document.getElementById('deleteEvent');
const addAttachmentButton = document.getElementById('addAttachmentButton');
const eventAttachmentInput = document.getElementById('eventAttachment');
const attachmentPreview = document.getElementById('attachmentPreview');
const detailsAttachmentPreview = document.getElementById('detailsAttachmentPreview');

let currentDate = new Date();
let selectedDate = null;
let calendarEvents = {};
let selectedAttachment = null;
let selectedAttachmentPreview = null;

function saveData() {
    localStorage.setItem('calendarEvents', JSON.stringify(calendarEvents));
}

window.onload = function() {
    if (localStorage.getItem('calendarEvents') === null) {
        calendarEvents = {};
        saveData();
    } else {
        calendarEvents = JSON.parse(localStorage.getItem('calendarEvents'));
    }

    renderCalendar();
    updateDate();
    setInterval(updateDate, 1000);

    addAttachmentButton.addEventListener('click', () => {
        eventAttachmentInput.click();
    });

    eventAttachmentInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            selectedAttachment = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                selectedAttachmentPreview = e.target.result;
                attachmentPreview.innerHTML = `<img src="${selectedAttachmentPreview}" style="max-width: 100px;">`;
                attachmentPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
};

function generateEventId() {
    return Math.random().toString(36).substr(2, 9);
}

function renderCalendar() {
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    monthYear.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    daysContainer.innerHTML = '';

    for (let i = 0; i < firstDayOfMonth; i++) {
        daysContainer.innerHTML += '<div></div>';
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
        const dateStr = date.toISOString().split('T')[0];
        const hasEvent = calendarEvents[dateStr] && calendarEvents[dateStr].length > 0;
        const dayElement = document.createElement('div');
        dayElement.textContent = i;
        if (hasEvent) {
            dayElement.classList.add('active');
        }
        dayElement.addEventListener('click', () => {
            selectedDate = date;
            if (hasEvent) {
                showEventDetails(calendarEvents[dateStr][0]);
            } else {
                showEventForm();
            }
        });
        daysContainer.appendChild(dayElement);
    }
}

function showEventForm() {
    eventForm.style.display = 'block';
    eventTitleInput.value = '';
    eventGuestsInput.value = '';
    eventDateInput.value = '';
    startTimeInput.value = '';
    endTimeInput.value = '';
    eventDescriptionInput.value = '';
    selectedAttachment = null;
    selectedAttachmentPreview = null;
    attachmentPreview.innerHTML = '';
    attachmentPreview.style.display = 'none';

    if (selectedDate) {
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const day = String(selectedDate.getDate()).padStart(2, '0');
        eventDateInput.value = `${year}-${month}-${day}`;
    }
}

function hideEventForm() {
    eventForm.style.display = 'none';
}

function saveEvent() {
    const title = eventTitleInput.value;
    const guests = eventGuestsInput.value;
    const date = eventDateInput.value;
    const startTime = startTimeInput.value;
    const endTime = endTimeInput.value;
    const description = eventDescriptionInput.value;

    if (title && date && startTime && endTime) {
        const dateTime = `${date}T${startTime}`;
        const eventData = {
            id: generateEventId(),
            title: title,
            guests: guests,
            dateTime: dateTime,
            endTime: `${date}T${endTime}`,
            description: description,
            attachment: selectedAttachment ? selectedAttachment.name : null,
            attachmentPreview: selectedAttachmentPreview
        };

        const dateStr = selectedDate.toISOString().split('T')[0];
        if (!calendarEvents[dateStr]) {
            calendarEvents[dateStr] = [];
        }
        calendarEvents[dateStr].push(eventData);
        saveData();
        hideEventForm();
        renderCalendar();
    }
}

function showEventDetails(event) {
    detailsTitle.textContent = event.title;
    detailsDateTime.textContent = new Date(event.dateTime).toLocaleString() + ' - ' + new Date(event.endTime).toLocaleTimeString();
    detailsGuests.textContent = event.guests ? 'Convidados: ' + event.guests : 'Não há participantes.';
    detailsDescription.textContent = event.description;
    if (event.attachmentPreview) {
        detailsAttachmentPreview.innerHTML = `<img src="${event.attachmentPreview}" style="max-width: 100px;">`;
    } else {
        detailsAttachmentPreview.innerHTML = '';
    }
    eventDetails.style.display = 'block';
    eventDetails.currentEvent = event;
}

function hideEventDetails() {
    eventDetails.style.display = 'none';
}

function deleteEvent() {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const eventToDelete = eventDetails.currentEvent;

    if (calendarEvents[dateStr]) {
        calendarEvents[dateStr] = calendarEvents[dateStr].filter(event => event.id !== eventToDelete.id);
        if (calendarEvents[dateStr].length === 0) {
            delete calendarEvents[dateStr];
        }
        saveData();
        hideEventDetails();
        renderCalendar();
    }
}

prevMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthBtn.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

saveEventBtn.addEventListener('click', saveEvent);
cancelEventBtn.addEventListener('click', hideEventForm);
closeDetails.addEventListener('click', hideEventDetails);
deleteEventBtn.addEventListener('click', deleteEvent);

function updateDate() {
    const dateElement = document.getElementById('getDate');
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    dateElement.textContent = now.toLocaleDateString('pt-BR', options);
}