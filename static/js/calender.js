const monthYearElement = document.getElementById('monthYear');
const datesElement = document.getElementById('dates');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

let currentDate = new Date();
let selectedDate = null;

const updateCalender = () =>{
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    const firstDay = new Date(currentYear, currentMonth, 0);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const totalDays = lastDay.getDate();
    const firstDayIndex = firstDay.getDay();
    const lastDayIndex = lastDay.getDay();
    const today = new Date();

    const monthYearString = currentDate.toLocaleDateString('defult', {month:'long', year:'numeric'});
    monthYearElement.textContent = monthYearString;

    let datesHTML = '';
    for (let i = firstDayIndex; i > 0; i--) {
        const prevDate = new Date(currentYear, currentMonth, 0-i+1);
        datesHTML += `<div class="date inactive"><abbr data-date="${prevDate.toISOString()}">${prevDate.getDate()}</abbr></div>`;
    }
    
    for (let i = 1; i <= totalDays; i++) {
        const date = new Date(currentYear, currentMonth, i);
        const activeClass = date.toDateString() == new Date().toDateString() ? 'active' : '';
        let disabledClass = date > today ? 'disabled' : '';
        datesHTML += `<div class="date ${disabledClass}"><abbr class="abbr ${activeClass}" data-date="${date.toISOString()}">${i}</abbr></div>`
    }

    for (let i = 1; i <= 7 - lastDayIndex; i++) {
        const nextDate = new Date(currentYear, currentMonth + 1, i);
        let disabledClass = nextDate > today ? 'disabled' : '';
        datesHTML += `<div class="date inactive ${disabledClass}"><abbr data-date="${nextDate.toISOString()}">${nextDate.getDate()}</abbr></div>`;
        
    }

    datesElement.innerHTML = datesHTML;

    if(currentMonth === today.getMonth() && currentYear === today.getFullYear()){
        nextBtn.classList.add('disabled');
        nextBtn.disabled = true;
    }else{
        nextBtn.classList.remove('disabled');
        nextBtn.disabled = false;
    }
}

datesElement.addEventListener('click', function(event){
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const data_date = new Date(event.target.getAttribute('data-date'));

    const options = { year: 'numeric', month: 'short', day: '2-digit' };
    const formattedDate = data_date.toLocaleDateString('en-US', options);
     
    if (event.target.tagName === 'ABBR' && data_date < today) {

        let custom_date = '';

        if(data_date.toDateString() === today.toDateString()){
            custom_date = 'Today';
        }else if(data_date.toDateString() === yesterday.toDateString()){
            custom_date = 'Yesterday';
        }else{
            custom_date = formattedDate;
        }

        const messageElement = document.getElementById(custom_date);
        if (messageElement) {
            messageElement.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }

        calender.classList.remove("show");  
    }
});

prevBtn.addEventListener('click', function(){
    currentDate.setMonth(currentDate.getMonth() - 1);
    updateCalender();
});

nextBtn.addEventListener('click', function(){
    if(!nextBtn.disabled){
        currentDate.setMonth(currentDate.getMonth() + 1);
        updateCalender();
    }
});

updateCalender();