const messageInput = document.getElementById('messageInput');
const micIcon = document.getElementById('micIcon');
const sendIcon = document.getElementById('sendIcon');
const searchInput = document.getElementById('search-input');
const searchClose = document.getElementById('search-close');
const chatlist = document.getElementById('chatlist');
const chatBlocks = chatlist.getElementsByClassName('block');
const introRight = document.querySelector('.intro-right');
const rightSide = document.querySelector('.rightside');
const rightSide_inside = document.querySelector('.rightside .rightchat_inside');
const createfriend = document.getElementById('createfriend');
const drawerclose = document.getElementById('drawer-close');
const leftsideDrawer = document.getElementById('leftsideDrawer');
const adduserDrawer  = document.getElementById('adduserDrawer');
const addUserBtn = document.getElementById('addUserBtn');
const adddrawerClose = document.getElementById('adduser-drawer-close');
const deleteDialog = document.getElementById('deleteDialog');
const cancelDialog = document.getElementById('cancelDelete');
const confirmDelete = document.getElementById('confirmDelete');
const saveButton = document.getElementById('save-btn');
const draweEmailInput = document.getElementById('drawer-email-input');
const drawe_CNTName_input = document.getElementById('drawer-CNTname-input');
const drwerChatlist  = document.querySelector('.drwer-chatlist');
const drawerSearchInput = document.getElementById('drawer-search-input');
const drwerSearchClose = document.getElementById('drawer-search-close');

const chat_box          = document.getElementById('chatBox'); 
const chat_box_input    = document.getElementById('chatbox_input');

// status profile  box change with status line and without status lines 
const topheader_Profile_Status = document.getElementById('topheader-profile-status');
const topheaderProfile_Status_Second = document.getElementById('topheader-profile-status-second');

// WebSocket  initialization
const roomName = 'chat_consumer'; 
const chatSocket = new WebSocket(
    `ws://${window.location.host}/ws/chat/${roomName}/`
);

let selectedUserId = null;
let lastDate = null;

//  show mic icon if input is Empty; otherwise, show send icon
function toggleSendIcon(){
    if (messageInput.value.trim() === '') {
        micIcon.style.display = 'block';
        sendIcon.style.display = 'none';
    } else {
        micIcon.style.display = 'none';
        sendIcon.style.display = 'block';
    }
}

toggleSendIcon();

// EventListeners
messageInput.addEventListener('input', toggleSendIcon);
            
if(searchInput.value.trim() === ''){
    searchClose.style.display = 'none';  
}

searchInput.addEventListener('input', () =>{
    const filter = searchInput.value.toLowerCase();
    
    for (let i = 0; i < chatBlocks.length; i++) {
        const userNameElement = chatBlocks[i].querySelector('.listHead h4');
        const userName  = userNameElement.textContent || userNameElement.innerText;
        chatBlocks[i].style.display = userName.toLowerCase().includes(filter) ? '' : 'none';   
    }
    searchClose.style.display = searchInput.value.trim() === '' ? 'none' : 'flex';   
});

searchClose.addEventListener('click', () => {
    searchInput.value = '';
    searchClose.style.display = 'none';  
    searchInput.focus();
    searchInput.dispatchEvent(new Event('input')); 
});
    
   
window.onload = function(){
    rightSide_inside.style.display = 'none';
    introRight.style.display = 'flex';
}; 
    
    
clickopenbox();
    
messageInput.addEventListener('keydown', function(event){
    if (event.key == 'Enter'){
        commenInput();
    }
});

sendIcon.onclick = () => commenInput();

createfriend.addEventListener('click', () => {
    getContacts('');
    leftsideDrawer.classList.add('open');
});

drawerclose.addEventListener('click',()=>{
    location.reload();
    leftsideDrawer.classList.remove('open');
});

addUserBtn.addEventListener('click', ()=>{
    adduserDrawer.classList.add('open');
});

adddrawerClose.addEventListener('click', ()=>{
    adduserDrawer.classList.remove('open');
});

cancelDialog.addEventListener('click',()=>{
    deleteDialog.style.display = 'none';
});

deleteDialog.addEventListener('click', function(e){
    if(e.target === deleteDialog){
        deleteDialog.style.display = 'none';
    } 
});

confirmDelete.addEventListener('click',()=>{
    const userId = deleteDialog.getAttribute('data-user-id');
    if(userId){
        deleteContact(userId);
    }   
});

const delete_model_userCHT = document.getElementById('delete_model_userCHT');
delete_model_userCHT.addEventListener('click', ()=>{
    deleteDialog.style.display = 'flex';
    const chat_USR_model = document.getElementById('chat_USR_model');

    const userId = chat_USR_model.getAttribute('data-user-id');
    const userName = chat_USR_model.getAttribute('data-user-name');
    document.getElementById('dialog-heading-ixt').textContent = `Delete chat with ${userName}`;
     
    deleteDialog.setAttribute('data-user-id', userId);
    chat_USR_model.style.display = 'none';
});


saveButton.addEventListener('click',()=>{
    const  emailRegex =  /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(draweEmailInput.value.trim() == '' || drawe_CNTName_input.value.trim() == ''){
        common_SHOW_messages('error', "Add all required information......!");
    }
    else if(!emailRegex.test(draweEmailInput.value)){
        common_SHOW_messages('error', "Enter valid email......!");
    }else{

        if(draweEmailInput.value.trim() != '' && drawe_CNTName_input.value.trim() != ''){
            
            saveContactsApi(draweEmailInput.value, drawe_CNTName_input.value);
        }else{
            common_SHOW_messages('error', "Add all required information......!");
        }
    }
});

if(drawerSearchInput.value.trim() === ''){
    getContacts('');
    drwerSearchClose.style.display = 'none';  
}
drawerSearchInput.addEventListener('input', () =>{
    if(drawerSearchInput.value.trim() === ''){
        getContacts('');
        drwerSearchClose.style.display = 'none';  
    } else {
        getContacts(drawerSearchInput.value);
        drwerSearchClose.style.display = 'flex'; 
    } 
});

drwerSearchClose.addEventListener('click', () => {
    drawerSearchInput.value = '';
    drwerSearchClose.style.display = 'none';  
    drawerSearchInput.focus();
}); 


// side header click functionality 

function closeAllDrawers(){
    document.querySelectorAll('.leftside-drawer').forEach(icon => {
        icon.classList.remove('open');
    });
    document.querySelectorAll('.chat_header_top_icon, .chat_header_userimg').forEach(icon => {
        icon.classList.remove('selected');
    });

}
 
let status_drawer_isOpen = false;
function toggleDrawer(drawerId, button){
    
    closeAllDrawers();
    const drawer =  document.getElementById(drawerId);
    if(drawer){
        drawer.classList.add('open');
    }
    status_drawer_isOpen = false; 

    button.classList.add('selected');
  
    if(drawerId === 'status_story'){
        status_data_get_On_button();
    }
}

// show status recent and viewed
const recentContainer = document.getElementById("recent-status-container");
const viewedContainer = document.getElementById("viewed-status-container");
const show_recent_status = document.getElementById("show_recent_status");
const show_viewed_status = document.getElementById("show_viewed_status"); 
let my_status_count;

const createStatusBox = (status) => {
    return `
        <div class="status-boxs" data-id="${status.id}">
            <div class="status-boxs-image">
                <svg width="48" height="48" viewBox="0 0 104 104">
                    <circle cx="52" cy="52" r="50" fill="none" stroke-linecap="round" stroke-dashoffset="50" 
                    stroke-dasharray="" stroke-width="4" style="stroke: #008069;" id="Unviewed_${status.id}" ></circle>
                    <circle cx="52" cy="52" r="50" fill="none" stroke-linecap="round" stroke-dashoffset="387.69908169872417" 
                    stroke-dasharray="50 271" stroke-width="4" style="stroke: #bbbec4;" id="Viewed_${status.id}"></circle> 
                           
                </svg>
                <div class="status-boxs-img-second">
                    <div class="status-boxs-final-imag" style="background-image: url(${status.image_url ? status.image_url : '/static/images/profile.png'});"></div>
                </div>
            </div>
            <div class="status-show-details">
                <span class="status-details-top">${status.name}</span>
                <span class="status-details-bottom">${status.time}</span>
            </div>
        </div>
    `;
};



// when user go to the status then change data 
function status_data_get_On_button(){
    status_drawer_isOpen = true;
    fetch('/get_recent_status/',{
        method:'GET',
        headers:{
            'Content-Type': 'application/json',
        }
    }).then(response => response.json()).then(data=>{
        
        if(data.mystatus_data.mystatus_count > 0){
            my_status_count =  data.mystatus_data.mystatus_count;
            topheader_Profile_Status.style.display = 'none';
            topheaderProfile_Status_Second.style.display = 'flex';
            profile_Status_Second_details.textContent = data.mystatus_data.my_status_upload_time;
            statusCountViewedAndUnviewed_lines("Unviewed", "Viewed", data.mystatus_data.mystatus_count, data.mystatus_data.mystatus_unviewed_count);
        }else{
            topheader_Profile_Status.style.display = 'flex';
            topheaderProfile_Status_Second.style.display = 'none';
        }
       
        

        api_functionality_recent_viewed_status(data);
        
    }).catch(error => {
        console.error('There was a problem with the fetch operation:', error);
    });
    
}


function api_functionality_recent_viewed_status(data){
    
    if(data.message != ''){
        show_recent_status.style.display = "flex";
        show_viewed_status.style.display = "flex";
    
        recentContainer.innerHTML = "";
        viewedContainer.innerHTML = "";
    }
    

    data.message.forEach((status)=>{
        
        if(status.unviewed_count > 0){
            recentContainer.innerHTML += createStatusBox(status);
        }else{
            viewedContainer.innerHTML += createStatusBox(status);
        }
        
        statusCountViewedAndUnviewed_lines(`Unviewed_${status.id}`, `Viewed_${status.id}`, status.totalStatus, status.unviewed_count,);
    });


    if(recentContainer.innerHTML.trim() === ""){
        show_recent_status.style.display = "none";
    }else if(viewedContainer.innerHTML.trim() === ""){
        show_viewed_status.style.display = "none";
    }


    const statusBoxes = document.querySelectorAll('.status-boxs');
    statusBoxes.forEach(box => {
        box.addEventListener('click', function() {
            const dataId = this.getAttribute('data-id');
            get_status_By_api(dataId);
            
        });
    });

}

 // chnange status recent and viewed When user viewed status 
function change_statusBox_RecentAndViewed(current_statusview_user_id, currentStatusIndex, statuses){
   
    const current_index_plush = currentStatusIndex + 1;
    if(statuses.length === current_index_plush){

        const statusBoxes = recentContainer.querySelectorAll(".status-boxs");
        if(statusBoxes.length === 1){
            show_recent_status.style.display = "none";
        } 
    
        const transfer_statusBox = recentContainer.querySelector(`.status-boxs[data-id="${current_statusview_user_id}"]`);
        if(transfer_statusBox){
            viewedContainer.appendChild(transfer_statusBox); 
        } 
    
        const viewedstatusBoxes = viewedContainer.querySelectorAll(".status-boxs");
        if(viewedstatusBoxes.length === 1){
            show_viewed_status.style.display = "flex";
        } 
    } 
}


// profile edit name and email funtionality
function setupEditableField(displayId, inputId, editIconId, checkIconId, loaderId){
    const displayElement = document.getElementById(displayId);
    const inputElement = document.getElementById(inputId);
    const editIconElement = document.getElementById(editIconId);
    const checkIconElement = document.getElementById(checkIconId);
    const loader = document.getElementById(loaderId);
    
    inputElement.style.display = 'none';
    checkIconElement.style.display = 'none';
    loader.style.display = 'none';
    inputElement.value = displayElement.textContent;

    editIconElement.addEventListener('click',function(){
        inputElement.style.display = '';
        checkIconElement.style.display = '';

        editIconElement.style.display = 'none';
        displayElement.style.display = 'none';
        inputElement.focus();
        inputElement.setSelectionRange(inputElement.value.length, inputElement.value.length);
    });

    checkIconElement.addEventListener('click', async function(){
        loader.style.display = '';
        checkIconElement.style.display = 'none';
        const success = await editProfileUrl(inputId, inputElement.value);
        if(success){
            inputElement.style.display = 'none';
            editIconElement.style.display = '';
            displayElement.style.display = '';
            loader.style.display = 'none';
            displayElement.textContent = inputElement.value;
        }else{
            loader.style.display = 'none';
            inputElement.style.display = 'none';
            checkIconElement.style.display = 'none';
            editIconElement.style.display = '';
            displayElement.style.display = '';
            loader.style.display = 'none';
        }
    });
}

setupEditableField("name-display", "name-input", "edit-icon-name", "check-icon-name", "edit-icon-name-loader" );
setupEditableField("email-display", "email-input", "edit-icon-email", "check-icon-email", "edit-icon-email-loader");

// drawer profile image taken by device
const profile_loader = document.getElementById('profile_loader');
function profikeImgTakenByDevice(event) {
    
    profile_loader.style.display = 'flex';

    const file = event.target.files[0]; 
    const reader = new FileReader();

    reader.onload = async function(e) {
        const profileImage = document.getElementById('drawer_profile_img');
        profileImage.src = e.target.result;
        const success = await editProfileUrl('profile_image', file);
        if(success){
            profile_loader.style.display = 'none';
        }
    };

    if(file){
        reader.readAsDataURL(file);
    }
}

//  drawer edit profile url 

function createFormData(field, value) {
    const formData = new FormData();
    formData.append(field, value);
    return formData;
}

async function editProfileUrl(field, value){
    try{
        const formData = createFormData(field, value);
        const response = await fetch('/edit_profile/', {
            method: 'POST',
            header:{
                'Content-Type':'application/json',
                'X-CSRFToken':getCookie('csrftoken')
            },
            body: formData,
        });
         
        if(response.ok){
            const data = await response.json();
            return true; 
        }else{
            console.error("Failed to update profile. Status:", response.status);
            return false;
        }
       

    }catch(error){
        console.error("Error:",error);
        return false;
    }
}

// logout profile
const logout_button = document.getElementById('logout-button');
logout_button.addEventListener('click', function(){
    window.location.href = '/signout/';
});

//  click plush button for create status

const topheaderAddStatus = document.getElementById('topheader-add-status');
const smallDrawerStatus = document.getElementById('small-drawer-status');
const scrollableContent = document.getElementById('scrollable-content');
let isDrawerOpen_status = false;
topheaderAddStatus.addEventListener('click', function(event){
    isDrawerOpen_status = !isDrawerOpen_status; 
    if(isDrawerOpen_status){
        topheaderAddStatus.style.background = "rgba(255, 255, 255, .1)";
        smallDrawerStatus.style.cssText = `transform-origin: right top;
        right: 74px;
        top: 56.5px;
        transform: scale(1);
        display:flex;
        border-radius: 18px;`;
        scrollableContent.style.overflowY = "hidden";
    }else{
        topheaderAddStatus.style.background = "";
        smallDrawerStatus.style.cssText = "display: none;";
        scrollableContent.style.overflowY = "auto";
    }
    event.stopPropagation();
   
});

document.addEventListener('click', function(event) {
    if (!topheaderAddStatus.contains(event.target)) {
        topheaderAddStatus.style.background = ""; 
        smallDrawerStatus.style.display = 'none';
        scrollableContent.style.overflowY = "auto";
    }

    if (!topheader_Profile_Status.contains(event.target)) { 
        smallDrawerStatus.style.display = 'none';
        scrollableContent.style.overflowY = "auto";
    }
});
topheader_Profile_Status.addEventListener('click', function(event){
    smallDrawerStatus.style.cssText = `transform-origin: right top;
    left: 44px;
    top: 103.5px;
    transform: scale(1);
    display:flex;
    border-radius: 18px;`;
    scrollableContent.style.overflowY = "hidden";
    event.stopPropagation();
});


// this is common function show lines viewed and unviewed 
function statusCountViewedAndUnviewed_lines(UnviewedId, ViewedId, totalStatus, totalCountOfUnviewed){
    const Unviewed = document.getElementById(UnviewedId);
    const viewed = document.getElementById(ViewedId);

    if (!Unviewed || !viewed) {
        console.error(`Elements with IDs "${UnviewedId}" or "${ViewedId}" not found.`);
        return;
    }

    Unviewed.innerHTML = '';
    viewed.innerHTML = '';
    viewed.style.removeProperty('display');
    
    const radius = 50;
    const circumference = 2 * Math.PI * radius;
    
    const totalDash = totalStatus;
    const unviewed_status = totalCountOfUnviewed;
    const viewed_status = totalDash - unviewed_status;
    
    const divideLength  = circumference / totalDash;
    const dashLength = divideLength - 10;
    
    
    const totalOfUnviewedDashs = divideLength * unviewed_status;
    
    const viewedDashSet =  387.69908169872417 - totalOfUnviewedDashs;
    
    
    const unviewed_last_gap_minus = circumference - totalOfUnviewedDashs;
    const unviewed_last_gap = unviewed_last_gap_minus + 10;
    
    
    if(totalDash != 1){
        Unviewed.setAttribute('stroke-dasharray',unviewed_status > 1 
            ? `${dashLength} 10 `.repeat(unviewed_status - 1) + `${dashLength} ${unviewed_last_gap}`
            : `${dashLength} ${unviewed_last_gap}`);
    }
    Unviewed.setAttribute('stroke-dashoffset',  387.69908169872417);
    
    
   
    if(viewed_status > 0){
            const totalOfUviewedDashs = divideLength * viewed_status;
            const viewed_last_gap = unviewed_status == viewed_status ? unviewed_last_gap  : circumference - totalOfUviewedDashs + 10;
        
            viewed.setAttribute('stroke-dasharray', viewed_status != 1  || unviewed_status != 0 ? `${dashLength} 10 `.repeat(viewed_status - 1 ) + `${dashLength} ${viewed_last_gap}`: '');
            viewed.setAttribute('stroke-dashoffset',  viewedDashSet);
    }else {
        viewed.style.display = "none";   
    }
}

// my status click show my status
    const statusViewBox = document.getElementById('status-viewBox');
    const statusBackground = document.querySelector('.status-viewBox-background-them'); 
    const statusImageDisplay = document.querySelector('.status-viewBox-show-status-second img'); 
    const statusVideoDisplay = document.querySelector('.status-viewBox-show-status-second video'); 
    const statusMoveLeftside = document.getElementById('status-move-leftside');
    const statusMoveRightside = document.getElementById('status-move-rightside');
    const status_viewBox_close = document.getElementById('status-viewBox-close');
    const status_viewBox_arrow = document.getElementById('status-viewBox-arrow');

    const type_reply_input = document.querySelector('.status-viewBox-show-status-bottom');
    const mystatus_viewedCount = document.querySelector('.status-viewBox-show-mystatus-status-bottom');
    const mystatus_viewedContent = document.querySelector('.status-viewBox-show-mystatus-content');
    const viewed_status_count_icon = document.querySelector('.status-viewBox-show-mystatus-viewedCount'); 
    const show_mystatus_viewedCount = document.querySelector('.status-viewBox-show-mystatus-viewedCount-items');
    const mystatus_dialog = document.querySelector('.mystatus_dialog');
    const mystatus_dialog_close = document.querySelector('.dialog_header_content svg');
    const mystatus_dialog_addcount = document.querySelector('.dialog_header_title h1');
    const statusviews_my_count = document.querySelector('.status-viewBox-show-mystatus-viewedCount-items div');
    const mystatus_dialog_django_content = document.querySelector('.dialog_content');
    const mystatus_for_dialog = document.querySelector('.dialog');
    const mystatus_pause = document.getElementById('mystatus_pause');
    const mystatus_play =  document.getElementById('mystatus_play');
    const mystatus_mute = document.getElementById('mystatus_mute');
    const mystatus_unmute = document.getElementById('mystatus_unmute');
    const mystatus_profile_time = document.getElementById('mystatus_profile_time');
    const mystatus_profile_name = document.getElementById('mystatus_profile_name');
    const mystatus_profile_img = document.getElementById('mystatus_profile_img');

    // this is for status reply 
    const statusview_input_reply = document.querySelector('.status-viewBox-show-status-bottom-reply-input');
    const type_reply_shadow = document.querySelector('.type_reply_shadow');
    const type_reply_sendButton = document.querySelector('.status-viewBox-show-status-bottom-reply-send svg');

    let currentStatusIndex = 0;
    let current_statusview_user_id = 0;
    let statuses = [];
    let isPlaying = false;
    let animationTimeout = null;
    let statusesViewed = [];
    let video_duration = 0; 
   
    let animationFrameId = null;
    let isPaused = false;
    let remainingTime = 0; 
    

    // check status view is open 
    let check_statusview_isopen = false;


    // status view close button click
    status_viewBox_close.addEventListener('click', function(){
        close_status_view();
        
    });

    status_viewBox_arrow.addEventListener('click', function(){
        close_status_view();
        
    });

    show_mystatus_viewedCount.addEventListener('click',function(){  

        handlePause();
        mystatus_dialog.style.display = 'flex';
    
    });

    mystatus_dialog_close.addEventListener('click', function(){

        handelResume();
        mystatus_dialog.style.display = 'none';
    
    });

    mystatus_play.addEventListener('click', function(){
        handlePause();
    });

    mystatus_pause.addEventListener('click', function(){        
        handelResume();
    });

    mystatus_mute.addEventListener('click', function(){
        console.log("video_is---------------mute");
        
        if (statusVideoDisplay.style.display === 'block') {
            mystatus_mute.style.display = "none";
            mystatus_unmute.style.display = "block";
            statusVideoDisplay.muted = !statusVideoDisplay.muted;
        }
    });

    mystatus_unmute.addEventListener('click', function(){
        if (statusVideoDisplay.style.display === 'block') {
            mystatus_unmute.style.display = "none";
            mystatus_mute.style.display = "block";
            statusVideoDisplay.muted = !statusVideoDisplay.muted;
        }
    });

    function handlePause(){
        const statusLines = document.querySelectorAll('.status-viewBox-top-calculation-line-bottom-top');
        const line = statusLines[currentStatusIndex];

        if (!line) {
            console.error('No line element found. Ensure currentStatusIndex is valid and the selector is correct.');
            return; // Exit the function early if line is not found
        }

        const computedStyle = getComputedStyle(line);
        if(computedStyle){
            const currentWidth = parseFloat(computedStyle.width); 
            const totalWidth = parseFloat(getComputedStyle(line.parentElement).width);
            const currentWidthPercentage = (currentWidth / totalWidth) * 100;
    
            if (statusVideoDisplay.style.display === 'block') {
                statusVideoDisplay.pause(); 
            }
        
            const totalDuration = statuses[currentStatusIndex].video_url
            ? Math.ceil(statusVideoDisplay.duration * 1000) : 5000;
            remainingTime = (100 - currentWidth) * (totalDuration / 100);
    
            cancelAnimationFrame(animationFrameId);
            animationFrameId = null;
            clearTimeout(animationTimeout);
            animationTimeout = null;
    
            line.style.transition = 'none'; 
            line.style.width = `${currentWidthPercentage}%`;
    
            mystatus_play.style.display = "none";
            mystatus_pause.style.display = "block";
        }
       
    }

    function handelResume(){
        const statusLines = document.querySelectorAll('.status-viewBox-top-calculation-line-bottom-top');
        const line = statusLines[currentStatusIndex];   

        if (statusVideoDisplay.style.display === 'block') {
            statusVideoDisplay.play(); // Resume video playback
        }
    
        line.style.transition = '';
        animateLine(line, remainingTime).then(() => {
            currentStatusIndex++;
            isPlaying = false;
            playAllStatuses();
        });

        mystatus_play.style.display = "block";
        mystatus_pause.style.display = "none";

    }


    function close_status_view(){
        
        statusViewBox.style.display = "none";
        change_statusBox_RecentAndViewed(current_statusview_user_id, currentStatusIndex, statuses);
        
        clearTimeout(animationTimeout);
        isPlaying = false;
        currentStatusIndex = 0;
        check_statusview_isopen = false;
        current_statusview_user_id = 0;
        
    }

    // status view reply input system   
    if(window.djangoUserId !== current_statusview_user_id){
         
        statusview_input_reply.addEventListener('focus',()=>{
            type_reply_shadow.style.display = "block";
            handlePause();
            type_reply_input.style.backgroundColor = '#202c33';
            type_reply_input.style.zindex = '2000';   
            type_reply_input.style.borderRadius = '20px'; 
            statusview_input_reply.style.backgroundColor = "#2a3942";
        });

        statusview_input_reply.addEventListener('blur', () => {
            type_reply_shadow.style.display = "none";
            handelResume();
            type_reply_input.style.backgroundColor = '';
            type_reply_input.style.zindex = '200';   
            type_reply_input.style.borderRadius = ''; 
            statusview_input_reply.style.backgroundColor = "rgba(11, 20, 26, .5)";
        });
    }
   
    type_reply_sendButton.addEventListener('click', function(){
        if(statusview_input_reply.value.trim() !== ""){
            chatSocket.send(JSON.stringify({
                'action':'send_message',
                'message': '',
                'receiver_id': current_statusview_user_id,
                'status_id':statuses[currentStatusIndex].id,
                'video_duration':video_duration,
                'status_reply_caption':statusview_input_reply.value,
            }));
            alert('successfully send reply by viewer status');
            statusview_input_reply.value = "";
        
        }
        
    });

    topheaderProfile_Status_Second.addEventListener('click', function(){
        get_status_By_api(window.djangoUserId);
    });


    function get_status_By_api(id){
        check_statusview_isopen = true;
        fetch(`/get_My_status/${id}/`,{
            method:'GET',
            headers:{
                'Content-Type': 'application/json',
            }
        }).then(response => response.json()).then(data=>{
            statuses = data.message;
            statusesViewed = Array(statuses.length).fill(false);
            statusViewBox.style.display = "flex";   
           
            const statusViewBox_Calculation_lines = document.querySelector('.status-viewBox-top-calculation-lines');
            statusViewBox_Calculation_lines.innerHTML = '';
           
            mystatus_profile_name.textContent = data.uploaded_status_user_name;
            mystatus_profile_img.src = data.uploaded_status_user_img;
           
        
        
        
            statuses.forEach((element, index) => {
            
                const statusLine = document.createElement('div');
                statusLine.classList.add('status-viewBox-top-calculation-line');

                const lineTop = document.createElement('div');
                lineTop.classList.add('status-viewBox-top-calculation-line-top');
                statusLine.appendChild(lineTop);

                const lineBottom = document.createElement('div');
                lineBottom.classList.add('status-viewBox-top-calculation-line-bottom');

                const lineBottomTop = document.createElement('div');
                lineBottomTop.classList.add('status-viewBox-top-calculation-line-bottom-top');
                lineBottomTop.textContent = element.statusText || "No status";

                lineBottom.appendChild(lineBottomTop);
                statusLine.appendChild(lineBottom);

                statusViewBox_Calculation_lines.appendChild(statusLine);
            });

        
            // Start showing statuses
            currentStatusIndex = 0;
            current_statusview_user_id = id; // Reset the index
            playAllStatuses();

        }).catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
        
    }
        
 
    async function   playAllStatuses(){
        
        if (isPlaying) return; // Prevent multiple playbacks
        isPlaying = true;
    

        const request_user_id = window.djangoUserId;

        const statusLines = document.querySelectorAll('.status-viewBox-top-calculation-line-bottom-top');
        
        
        for (let i = currentStatusIndex; i < statuses.length; i++) {
            currentStatusIndex = i; 
            video_duration = 0;
           
            statusview_input_reply.value = "";
            
            
            if(!statusesViewed[currentStatusIndex] && statuses[i].is_viewed == false){
                statusesViewed[currentStatusIndex] = true;
            

                const totalStatus = statuses.length;
                const totalCountOfUnviewed = statusesViewed.filter(viewed => !viewed).length;
                
                
                if(request_user_id === current_statusview_user_id){
                    statusCountViewedAndUnviewed_lines("Unviewed", "Viewed", totalStatus, totalCountOfUnviewed);
                }else{
                    statusCountViewedAndUnviewed_lines(`Unviewed_${current_statusview_user_id}`, `Viewed_${current_statusview_user_id}`, totalStatus, totalCountOfUnviewed); 
                }
            
                add_Viewed_status(statuses[i].id); 

            }else{
                statusesViewed[currentStatusIndex] = true;
            }  

            if(request_user_id === current_statusview_user_id){
                type_reply_input.style.display = 'none';
                
                viewed_status_count_icon.style.display = 'flex';
                mystatus_viewedCount.style = 'padding-bottom:10px';
               
                if(statuses[i].caption){
                    mystatus_viewedCount.style.background = 'rgba(0, 0, 0, .4)';
                    mystatus_viewedContent.style.display = 'flex';
                    mystatus_viewedContent.innerText = statuses[i].caption;
                }else{
                    mystatus_viewedCount.style.background = 'none';
                    mystatus_viewedContent.style.display = 'none';
                }
            
            }else{
               
                viewed_status_count_icon.style.display = 'none';
                type_reply_input.style.display = 'block';
               
                if(statuses[i].caption){
                    mystatus_viewedCount.style.background = 'rgba(0, 0, 0, .4)';
                    mystatus_viewedCount.style = 'padding-bottom:80px';
                    mystatus_viewedContent.style.display = 'flex';
                    mystatus_viewedContent.innerText = statuses[i].caption; 
                }else{
                    mystatus_viewedCount.style.display = "none";
                }

            }

            
        
            statusBackground.style.backgroundImage = `url(${statuses[i].image_url})`
        
            let animationDuration = 5000;
            if (statuses[i].video_url){
                
                statusVideoDisplay.src = statuses[i].video_url;
                statusVideoDisplay.load();
                statusVideoDisplay.play();

                statusVideoDisplay.style.display = 'block';  
                statusImageDisplay.style.display = 'none';

                await new Promise(resolve => {
                    statusVideoDisplay.addEventListener('loadedmetadata', function handler() {
                        video_duration = statusVideoDisplay.duration;
                        animationDuration = Math.ceil(statusVideoDisplay.duration * 1000); 
                        statusVideoDisplay.removeEventListener('loadedmetadata', handler);
                        resolve();
                    });
                });
            }else{
                statusImageDisplay.src = statuses[i].image_url;
                statusImageDisplay.style.display = 'block';
                statusVideoDisplay.style.display = 'none';
            }
        
            // how to viewer show my status 
            statusviews_my_count.textContent = statuses[i].mystatus_viewers_count;
            mystatus_profile_time.textContent =  statuses[i].time; 

            mystatus_dialog_addcount.textContent = `Viewed by ${statuses[i].mystatus_viewers_count}`;
            mystatus_dialog_django_content.innerHTML = '';

            if(statuses[i].mystatus_viewers_count > 0){
                mystatus_for_dialog.style.height = "";
                statuses[i].mystatus_viewers.forEach((data, index)=>{
                    mystatus_dialog_django_content.innerHTML += 
                        `
                        <div class="block" >
                                    <div class="block_second">
                                        <div class="img-top">
                                            <div class="img-second">
                                                <div class="imgbox">
                                                    <img src="${data.image_url}" class="cover">
                                                </div>
                                            </div>
                                        </div>    
                                        <div class="details">
                                            <div class="details_title">
                                                <div class="details_title_second">
                                                    <div class="details_content_second">
                                                        <span>${data.viewer_name}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="details_content">
                                                <span>${data.time}</span>
                                            </div>
                                            
                                        </div>  

                                    </div>                      
                                </div> 
                        `;
                });
                
            

            }else{
                mystatus_for_dialog.style.height = "159px";
                mystatus_dialog_django_content.innerHTML = `<span>No Views Yet</span>`;
            }
            
            // this is some video mute functionality
            mystatus_unmute.style.display = "none";
            mystatus_mute.style.display = "block";
            statusVideoDisplay.muted = !statusVideoDisplay.muted;
      
            await animateLine(statusLines[i],  animationDuration);
        }
        isPlaying = false;
        
        close_status_view();
        
    }




    function animateLine(line, duration) {
        
        return new Promise(resolve => {
        

            line.style.width = '0%';
            line.style.transition = `width ${duration}ms linear`;

            animationFrameId = requestAnimationFrame(() => {
               
                line.style.width = '100%';
            });

            animationTimeout = setTimeout(() => {
                resolve();
            }, duration);
        
        });

    
    }

    function moveStatus(direction) {
        mystatus_play.style.display = "block";
        mystatus_pause.style.display = "none";

        const statusLines = document.querySelectorAll('.status-viewBox-top-calculation-line-bottom-top');

        const currentLine = statusLines[currentStatusIndex];
        currentLine.style.width = direction === 'right' ? '100%' : '0%';
        currentLine.style.transition = 'none';
        currentLine.offsetWidth;

        if(direction === 'right'){
            currentStatusIndex++;
        }else if(direction === 'left'){
            currentStatusIndex--;
        }

        const targetLine = statusLines[currentStatusIndex];
        targetLine.style.width = '0%';
        targetLine.style.transition = 'none';
        targetLine.offsetWidth;

        statusBackground.style.backgroundImage = `url(${statuses[currentStatusIndex].image_url})`;
        statusImageDisplay.src = statuses[currentStatusIndex].image_url;
        
    }

    statusMoveLeftside.addEventListener('click', async function(){
        if (statuses.length === 0 ||  currentStatusIndex === 0) return;

        clearTimeout(animationTimeout);
        isPlaying = false; 

        moveStatus('left');
        
        playAllStatuses();

        
    });



    statusMoveRightside.addEventListener('click',   function(){
        const minuse_one = statuses.length - 1 ;
        if (statuses.length === 0 || currentStatusIndex == minuse_one) return;

        
        clearTimeout(animationTimeout); 
        isPlaying = false; 

        moveStatus('right');

        
        playAllStatuses();
    });
 
// create viewed status change in data base with api
function add_Viewed_status(status_id){
    fetch('/add_viewed_status/',{
        method:'POST',
        headers:{
            'Content-Type':'application/json',
            'X-CSRFToken':getCookie('csrftoken')
        },
        body:JSON.stringify({'status_id':status_id}),
    }).then(response => response.json()).then(data=>{
        console.log('Data:',data);
    }).catch(error => {
        console.error('Error:',error);
    });
}


// file upload 
const file_preview_container = document.getElementById('file_preview_container');
const file_preview_Close = document.getElementById('file_preview_Close');

const plus_upload_btn = document.getElementById('plus_upload_btn');
const plusDropdown = document.getElementById('plus-dropdown-menu');

const textarea = document.getElementById("captinoInput");
textarea.addEventListener("input", function () {
  const initialHeight = window.innerWidth <= 500 ? 20 : 24;
  textarea.style.height = `${initialHeight}px`;
  textarea.style.height = `${Math.min(textarea.scrollHeight, 100)}px`;
});

let rotated = false;
plus_upload_btn.addEventListener('click', ()=>{
 
    plus_upload_btn.style.transition = 'transform 0.1s ease-in-out';
    rotated = !rotated;
    if(rotated){
        plus_upload_btn.style.transform = 'rotate(45deg)';
        plusDropdown.style.cssText = `
            display: block;
            transform: translateY(0);
            opacity: 1; 
        `;  
    }else{
        plus_upload_btn.style.transform = 'rotate(0deg)';
        plusDropdown.style.cssText = `
            display: none;
            transform: translateY(0);
            opacity: 1;
        `; 
    }
});

document.addEventListener('click',function(event){
    if(!plusDropdown.contains(event.target) && !plus_upload_btn.contains(event.target)){
        plus_upload_btn.style.transform = 'rotate(0deg)';
        plusDropdown.style.cssText = `
            display: none;
            transform: translateY(0);
            opacity: 1;
        `; 

    } 
});


file_preview_Close.addEventListener('click',()=>{
    clearFiles(); 
});

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ result: e.target.result, file });
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function clearFiles(){
    file_preview_container.style.display = 'none';
    chat_box.style.display = 'block';
    chat_box_input.style.display = 'flex';
    
    const multipleImg = document.querySelector('.preview_bottom .send-images .multiple-image');
    multipleImg.innerHTML = '';
    
    const imagePreview = document.querySelector(".file-preview");
    imagePreview.innerHTML = '';
}

function closeDrawandOpenImgView(){
    if(chat_box){
        plusDropdown.style.cssText = `
            display: none;
            transform: translateY(0);
            opacity: 1;
        `; 
        chat_box.style.display = 'none';
        chat_box_input.style.display = 'none';
    }
    file_preview_container.style.display = 'flex';
    
}

// loader
const multipleItems = document.getElementById('multiple-items');
const dataLoader = document.getElementById('loader');

function startLoading(){
    multipleItems.style.display = "none";
    dataLoader.style.display  = "flex";
}

function stopLoading(){
    multipleItems.style.display = "contents";
    dataLoader.style.display  = "none";
}

function extractVideoThumbnail(videoFile){
    return new Promise((resolve, reject) => {
        const videoElement = document.createElement('video');
        const canvasElement = document.createElement('canvas');
        const context = canvasElement.getContext('2d');

        const videoURL = URL.createObjectURL(videoFile);
        videoElement.src = videoURL;

        videoElement.muted = true;
        videoElement.playsInline = true;
        videoElement.autoplay = true;

        videoElement.addEventListener('loadeddata', () => {
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;

           
            context.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);
            const thumbnailDataUrl = canvasElement.toDataURL('image/png');

            URL.revokeObjectURL(videoURL);
            resolve(thumbnailDataUrl);
        });

        videoElement.addEventListener('error', (e) => {
            reject(new Error('Error loading video file for thumbnail extraction.'));
        });
    });
}

function isCheckLogic(result, checkIsVideo){
    const fileTakePrviews = document.querySelector(".file-preview");
    let file_tag = ``;
    if(fileTakePrviews){
        fileTakePrviews.innerHTML = "";
    }
    

    if (checkIsVideo) {
        file_tag = `
        <video id="previewVideo" controls>
            <source src=${result} type="video/mp4">
        </video>`;
    } else {
        file_tag = `<img id="previewImage" src=${result} alt="Image Preview">`;
    }
    fileTakePrviews.insertAdjacentHTML('beforeend', file_tag);
}


let fileIndexCounter = 0;
let fileBlobs = [];
let file_check = '';

function handle_upload_files(event){
    const input = event.target;
    const files = input.files;
     
    closeDrawandOpenImgView();
    startLoading();
    
   
    const  mulitiple_files_view  = document.querySelector('.preview_bottom .send-images .multiple-image');
    const file_caption_input = document.getElementById("captinoInput");     
    const file_caption_close = document.getElementById("caption-close"); 

    const isFirstUpload = mulitiple_files_view.innerHTML.trim() === '';

    if(isFirstUpload){

        if(input.id === 'chat-file'){
            file_preview_container.classList.add('file-preview-common-chat');
            file_check = 'chat';
    
        }else if(input.id === 'status-upload'){
            file_preview_container.classList.add('file-preview-common-satus');
            file_check = 'status';
        }
    
        fileIndexCounter = 0;  
        fileBlobs = [];  
        file_caption_input.value="";
        file_caption_input.setAttribute('data-index', '0');
    }

    const filePromises = Array.from(event.target.files).map((file)=>{
        return new Promise((resolve, reject)=>{
            
            if(file.type.startsWith('video/') && file.size > 10 * 1024 * 1024){
                alert(`The video file "${file.name}" exceeds the size limit of 10 MB and will be skipped.`);
                return resolve(null);
            }

            const isVideo = file.type.startsWith('video/');

            if(isVideo){
                const video = document.createElement("video");
                const videoFileUrl = URL.createObjectURL(file);

                video.src = videoFileUrl;

                video.onloadedmetadata = function(){
                    if(video.duration > 30){
                        alert(`The video file "${file.name}" duration must be less than or equal to 30 seconds.`);
                        return resolve(null);
                    }
                    
                    readFile(file).then(resolve).catch(reject);
                }
            }else{
                readFile(file).then(resolve).catch(reject);
            }

        });
    }).filter((promise) => promise !== null);

    Promise.all(filePromises).then((fileDataArray)=>{
        fileDataArray.filter((fileData) => fileData !== null).forEach( ({result, file }) => {
            const isVideo = file.type.startsWith('video/');
            let imgTeg;
            if (isVideo) {
                extractVideoThumbnail(file).then(thumbnailDataUrl =>{
                    imgTeg = `
                        <button class="multipleFileBtn" data-index="${fileIndexCounter}" data-caption="" data-src="${result}">
                            <div class="first">
                                <span id="st-removeFile">
                                    <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" class="" version="1.1" x="0px" y="0px" enable-background="new 0 0 24 24"><title>x-alt</title><path fill="currentColor" d="M17.25,7.8L16.2,6.75l-4.2,4.2l-4.2-4.2L6.75,7.8l4.2,4.2l-4.2,4.2l1.05,1.05l4.2-4.2l4.2,4.2l1.05-1.05 l-4.2-4.2L17.25,7.8z"></path></svg>
                                </span>
                            </div>
                            <div class="second">
                                <div class="inside">
                                    <img alt="Video Thumbnail" class="cover" src="${thumbnailDataUrl}">
                                </div>
                            </div>
                        </button>
                    `;

                    const byteString = atob(thumbnailDataUrl.split(',')[1]);
                    const arrayBufferr = new ArrayBuffer(byteString.length);
                    const uint8Array = new Uint8Array(arrayBufferr);
                    
                    for(let i=0; i<byteString.length; i++){
                        uint8Array[i] = byteString.charCodeAt(i);
                    }
                
                    const blob = new Blob([uint8Array], {type: 'image/png'});
                    const background_file = new File([blob], 'thumbnail.png', { type: 'image/png' });

                    mulitiple_files_view.insertAdjacentHTML('beforeend', imgTeg);
                    fileBlobs.push({
                        file: file,
                        background_file:background_file,
                        index: fileIndexCounter,
                        type: true,
                    }); 

                    if (fileIndexCounter === 0 && isFirstUpload) {
                        isCheckLogic(result, true);
                    }

                    fileIndexCounter++;
   
                });

            }else{
                imgTeg = `
                    <button class="multipleFileBtn" data-index="${fileIndexCounter}" data-caption="">
                        <div class="first">
                            <span id="st-removeFile">
                                <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" class="" version="1.1" x="0px" y="0px" enable-background="new 0 0 24 24"><title>x-alt</title><path fill="currentColor" d="M17.25,7.8L16.2,6.75l-4.2,4.2l-4.2-4.2L6.75,7.8l4.2,4.2l-4.2,4.2l1.05,1.05l4.2-4.2l4.2,4.2l1.05-1.05 l-4.2-4.2L17.25,7.8z"></path></svg>
                            </span>
            
                        </div>
                        <div class="second">
                            <div class="inside">
                                <img alt="Preview" class="cover" src="${result}">
                            </div>
                        </div>
                    </button>
                `;
                mulitiple_files_view.insertAdjacentHTML('beforeend', imgTeg);
                fileBlobs.push({
                    file: file,
                    index: fileIndexCounter,
                    type:false,
                }); 

                if (fileIndexCounter === 0 && isFirstUpload) {
                    isCheckLogic(result, false);
                } 

                fileIndexCounter++;
            }

        });
    });  

    const observer = new MutationObserver(()=>{
        const multiple_File_Btn = document.querySelectorAll('.multipleFileBtn');

        if(isFirstUpload){
            multiple_File_Btn[0].classList.add('selected');
            const caption = multiple_File_Btn[0].getAttribute('data-caption');
            file_caption_input.value = caption || '';
        }

        const  mulitiple_files_view  = document.querySelector('.preview_bottom .send-images .multiple-image');
        mulitiple_files_view.addEventListener('click', function(event){
            if(event.target.closest('#st-removeFile')){
                const button = event.target.closest('.multipleFileBtn');
                if(button){
                    const isSelected = button.classList.contains('selected');
                    button.remove();

                    const dataIndex = button.getAttribute('data-index');
                    const indexToRemove = parseInt(dataIndex);
                    fileBlobs.splice(indexToRemove, 1);
                    
                    const remainingButtons = document.querySelectorAll('.multipleFileBtn');
                    if(remainingButtons.length > 0){
                        if(isSelected){
                            
                            remainingButtons[0].classList.add('selected');
                            const imgElement = remainingButtons[0].querySelector('img');
                            const dataOfSrc = remainingButtons[0].getAttribute('data-src');
                            if(dataOfSrc){
                                isCheckLogic(dataOfSrc, true);
                            }else{
                                isCheckLogic(imgElement.src, false);
                            }
                            
                            const caption  = remainingButtons[0].getAttribute('data-caption');
                            file_caption_input.value = caption || '';
                            file_caption_input.setAttribute('data-index',  remainingButtons[0].getAttribute('data-index'));                            

                        }
                    }else{
                        file_preview_container.style.display = 'none';
                    }
                }

            }else if(event.target.closest('.multipleFileBtn')){
                const clickedButton = event.target.closest('.multipleFileBtn');
                const multiple_File_Btn = document.querySelectorAll('.multipleFileBtn');

                multiple_File_Btn.forEach(item => item.classList.remove('selected'));
                clickedButton.classList.add('selected');

                const imgElement = clickedButton.querySelector('img');
                const dataSrc = clickedButton.getAttribute('data-src');
                if(dataSrc){
                    isCheckLogic(dataSrc, true);
                }else{
                    isCheckLogic(imgElement.src, false);
                }


                const caption = clickedButton.getAttribute('data-caption');
                const file_caption_input = document.getElementById("captinoInput");  
                file_caption_input.value = caption || '';
                file_caption_input.setAttribute('data-index', clickedButton.getAttribute('data-index'));
            }
        });
        observer.disconnect();
    });
    
    observer.observe(mulitiple_files_view, { childList: true });

    file_caption_input.addEventListener('input', function(){
        const selectedIndex = this.getAttribute('data-index');
        const file_Button = document.querySelector(`.multipleFileBtn[data-index="${selectedIndex}"]`);
        if(file_Button){
            file_Button.setAttribute('data-caption', this.value);   
        }
    });

    file_caption_close.addEventListener('click', function(){
        const selectedIndex = statusCaptionInput.getAttribute('data-index');
        const file_Button = document.querySelector(`.multipleFileBtn[data-index="${selectedIndex}"]`);

        if(file_Button){
            file_caption_input.value = '';
            file_Button.setAttribute('data-caption', '');
        }
    });

    stopLoading();
}


const sendFiles = document.getElementById('sendFiles');

sendFiles.addEventListener('click', function(){

    if(fileBlobs.length > 0){
        fileBlobs.forEach(async (file,  index)=>{
            const formData = new FormData();

            if(file.type){
                formData.append('video', file.file);
                formData.append('background_img', file.background_file);
            }else{
                formData.append('image', file.file);
            }

            const file_caption_get = document.querySelector(`.multipleFileBtn[data-index="${file.index}"]`);
            const caption = file_caption_get ? file_caption_get.getAttribute('data-caption') : '';
            formData.append('caption', caption);  

            if(file_check == 'chat'){
                formData.append('receiver_usr',selectedUserId);
                await fileSendToApi(formData, index, '/upload-video/');
            }else if(file_check  == 'status'){
                await fileSendToApi(formData, index, '/upload_status/');
            }

        });
        clearFiles();
    }

});

const profile_Status_Second_details = document.getElementById('profile_Status_Second_details');
async function fileSendToApi(formatDate, index, api){
    try{
        const response = await fetch(api,{
            method:'POST',
            header:{
                'Content-Type':'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body:formatDate,
        });

        if(response.ok){
            const data = await response.json();
            let checking = fileBlobs.length - 1;

            if(checking === index){

                fileBlobs=[];
                if(file_check == 'status'){
                    topheaderProfile_Status_Second.style.display = 'flex';
                    topheader_Profile_Status.style.display = 'none';  
                    document.querySelector('.status_preview_bottoms .send-images .status-multiple-files').innerHTML = '';
                }
                 
            }

            if(file_check == 'chat'){

                chatSocket.send(JSON.stringify({
                                'action': 'send_message',
                                'message': '',
                                'receiver_id': selectedUserId,
                                'Send_Data': data.message,
                            })); 
            
            }else if(file_check == 'status'){
                
                profile_Status_Second_details.textContent = data.message['Upload_time']; 
                my_status_count = data.message.total_count_status;
                statusCountViewedAndUnviewed_lines("Unviewed", "Viewed", data.message.total_count_status, data.message.unviewed_count);
    
                chatSocket.send(JSON.stringify({
                    'action':'uploade_status',
                    'uploaded_user_id': data.user_id,
                    'status_id':data.message.id,  
                    'uploaded_users_contacts':data.user_contacts, 
                }));
            }
        }

    }catch(error){
        console.error("Error:",error);
    }


}




// file view close icon
const fileViewClose = document.getElementById('file_view_close');
const fileView = document.getElementById('file_view');
const fileDiv = document.querySelector('.file');

fileViewClose.addEventListener('click',()=>{
   fileView.style.display = 'none';
   fileDiv.innerHTML = ''; 
});

// file view in message click open view image and video
function playVideo(url, checkings){
    fileView.style.display = 'flex';
    fileDiv.innerHTML = '';
    
    if(checkings == 'true'){
        const imgTag = document.createElement('img');
        imgTag.src = url; 
        imgTag.alt = 'File Image';
    
        fileDiv.appendChild(imgTag);
    }else{
     
        const videoTag = document.createElement('video');
        videoTag.src = url; 
        videoTag.controls = true; 
        fileDiv.appendChild(videoTag);
    }
    
    

}

// Websocket event handlers
let chat_history_search_MSG;

function adding_update_MSG_array(data){
    const existingMessageGroup = chat_history_search_MSG.history.find(group => group.date === data.label_time);
    if(existingMessageGroup){
        const existingMessage = existingMessageGroup.messages.find(msg => msg.message_id === data.message_id);
        if(existingMessage){
            existingMessage.content = data.content;
            existingMessage.timestamp = data.timestamp;
        }else{
            existingMessageGroup.messages.push({
                content: data.content,
                sender_id: data.sender_id,
                receiver_id: data.receiver_id,
                timestamp: data.timestamp,
                url: data.url,
                caption: data.caption,
                type_content: data.type_content,
                is_reply_status: data.is_reply_status,
                reciver_name: data.reciver_name,
                video_duration: data.video_duration,
                receiver_message_view: data.receiver_message_view,
                message_id: data.message_id
            });

            existingMessageGroup.messages.sort((a,b) => new Date(a.timestamp)- new Date(b.timestamp));
        }
    }else{
        const newDateGroup = {
            date: data.label_time,
            messages: [
                {
                    content: data.content,
                    sender_id: data.sender_id,
                    receiver_id: data.receiver_id,
                    timestamp: data.timestamp,
                    url: data.url,
                    caption: data.caption,
                    type_content: data.type_content,
                    is_reply_status: data.is_reply_status,
                    reciver_name: data.reciver_name,
                    video_duration: data.video_duration,
                    receiver_message_view: data.receiver_message_view,
                    message_id: data.message_id
                }
            ]
        };
        chat_history_search_MSG.history.push(newDateGroup);
    }
}

chatSocket.onmessage = function(e){
        const data = JSON.parse(e.data);
        console.log(data);
        
        if(data.type == 'chat_history'){

            if(selectedUserId === data.receiver_id){
                chat_history_search_MSG = data;
                handleChathistory(data);   
            }
           
        }else if(data.type == 'chat_message'){

            if(data.check_contact &&  Object.keys(data.check_contact).length > 0 && data.sender_id !== Number(djangoUserId)){
                
                const chatlist = document.getElementById('chatlist');
            
                const _id = data.check_contact._id;
                const url = data.check_contact.profile_img ? data.check_contact.profile_img :"/static/images/profile.png";
                const username = data.check_contact.username;

                chatlist.innerHTML += `
                <div class="block" >
                    <div class="inside" data-user-id="${_id}">
                        <div class="imgbox">
                            <img src="${url}" class="cover">                    
                        </div>    
                        <div class="details">
                            <div class="listHead">
                                <h4>${username}</h4>
                                <p class="time">${data.last_msg_time}</p>
                            </div>
                            <div class="message_p">
                                  <p>"Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them. Click to learn more"</p>
                                
                                ${data.toggle_count > 0 ?
                                    `<b class="toggle-count">${data.toggle_count}</b>`
                                :''}
                                
                            </div>
                        </div>                        
                    </div>
                </div>
                `;
                clickopenbox();
            }

            if(chat_history_search_MSG){
                adding_update_MSG_array(data);
            }
            handleChatMessage(data);
        
        }
        else if(data.type  == 'user_status' && selectedUserId == data.user_id){
            
            is_online = data.is_online
            
            const statusText = document.getElementById('statusText');
            statusText.textContent = is_online ? "Online" : "Offline";   
        }else if(data.type == 'status_update'){

            const userExists = data.message['uploaded_users_contacts'].some(item => item.user_id === Number(djangoUserId) && item.delete_status == false);
            if(userExists){
                status_update(data.message['uploaded_user_id'],data.message['status_id']); 
            }else {
                if(data.message['uploaded_user_id'] == djangoUserId){
                    status_update(data.message['uploaded_user_id'],data.message['status_id']); 
                }
            }
            
        }else if(data.type == 'uploade_status'){
            const userExists = data.uploaded_users_contacts.some(item => item.user_id === Number(djangoUserId) && item.delete_status == false);
            if(userExists){
                if(status_drawer_isOpen){
                    status_data_get_On_button();
                }    
            }else{
                if(data.message['uploaded_user_id'] == djangoUserId){

                    status_data_get_On_button();
                }
            }
            
        }else if(data.type  == 'receiver_message_delivered' && selectedUserId == data.receiver_id){
            let messageElement = document.querySelector(`[message="message_${data.message_id}"]`);
            messageElement.innerHTML = '';
            messageElement.innerHTML = '<svg viewBox="0 0 16 11" height="11" width="16" preserveAspectRatio="xMidYMid meet" class="" fill="none"><title>msg-dblcheck</title><path d="M11.0714 0.652832C10.991 0.585124 10.8894 0.55127 10.7667 0.55127C10.6186 0.55127 10.4916 0.610514 10.3858 0.729004L4.19688 8.36523L1.79112 6.09277C1.7488 6.04622 1.69802 6.01025 1.63877 5.98486C1.57953 5.95947 1.51817 5.94678 1.45469 5.94678C1.32351 5.94678 1.20925 5.99544 1.11192 6.09277L0.800883 6.40381C0.707784 6.49268 0.661235 6.60482 0.661235 6.74023C0.661235 6.87565 0.707784 6.98991 0.800883 7.08301L3.79698 10.0791C3.94509 10.2145 4.11224 10.2822 4.29844 10.2822C4.40424 10.2822 4.5058 10.259 4.60313 10.2124C4.70046 10.1659 4.78086 10.1003 4.84434 10.0156L11.4903 1.59863C11.5623 1.5013 11.5982 1.40186 11.5982 1.30029C11.5982 1.14372 11.5348 1.01888 11.4078 0.925781L11.0714 0.652832ZM8.6212 8.32715C8.43077 8.20866 8.2488 8.09017 8.0753 7.97168C7.99489 7.89128 7.8891 7.85107 7.75791 7.85107C7.6098 7.85107 7.4892 7.90397 7.3961 8.00977L7.10411 8.33984C7.01947 8.43717 6.97715 8.54508 6.97715 8.66357C6.97715 8.79476 7.0237 8.90902 7.1168 9.00635L8.1959 10.0791C8.33132 10.2145 8.49636 10.2822 8.69102 10.2822C8.79681 10.2822 8.89838 10.259 8.99571 10.2124C9.09304 10.1659 9.17556 10.1003 9.24327 10.0156L15.8639 1.62402C15.9358 1.53939 15.9718 1.43994 15.9718 1.32568C15.9718 1.1818 15.9125 1.05697 15.794 0.951172L15.4386 0.678223C15.3582 0.610514 15.2587 0.57666 15.1402 0.57666C14.9964 0.57666 14.8715 0.635905 14.7657 0.754395L8.6212 8.32715Z" fill="currentColor"></path></svg>';
        
        }else if(data.type == 'change_message_status_by_receiver'){
            if(window.djangoUserId == data.sender_id && selectedUserId == data.receiver_id && data.receiver_message_view == 'seen'){
                let messageElement = document.querySelector(`.message_${data.message_id}`);
                   
                if(messageElement){
                    messageElement.innerHTML = '';
                    messageElement.innerHTML = '<svg viewBox="0 0 16 11" height="11" width="16" preserveAspectRatio="xMidYMid meet" class="" fill="none"><title>msg-dblcheck</title><path d="M11.0714 0.652832C10.991 0.585124 10.8894 0.55127 10.7667 0.55127C10.6186 0.55127 10.4916 0.610514 10.3858 0.729004L4.19688 8.36523L1.79112 6.09277C1.7488 6.04622 1.69802 6.01025 1.63877 5.98486C1.57953 5.95947 1.51817 5.94678 1.45469 5.94678C1.32351 5.94678 1.20925 5.99544 1.11192 6.09277L0.800883 6.40381C0.707784 6.49268 0.661235 6.60482 0.661235 6.74023C0.661235 6.87565 0.707784 6.98991 0.800883 7.08301L3.79698 10.0791C3.94509 10.2145 4.11224 10.2822 4.29844 10.2822C4.40424 10.2822 4.5058 10.259 4.60313 10.2124C4.70046 10.1659 4.78086 10.1003 4.84434 10.0156L11.4903 1.59863C11.5623 1.5013 11.5982 1.40186 11.5982 1.30029C11.5982 1.14372 11.5348 1.01888 11.4078 0.925781L11.0714 0.652832ZM8.6212 8.32715C8.43077 8.20866 8.2488 8.09017 8.0753 7.97168C7.99489 7.89128 7.8891 7.85107 7.75791 7.85107C7.6098 7.85107 7.4892 7.90397 7.3961 8.00977L7.10411 8.33984C7.01947 8.43717 6.97715 8.54508 6.97715 8.66357C6.97715 8.79476 7.0237 8.90902 7.1168 9.00635L8.1959 10.0791C8.33132 10.2145 8.49636 10.2822 8.69102 10.2822C8.79681 10.2822 8.89838 10.259 8.99571 10.2124C9.09304 10.1659 9.17556 10.1003 9.24327 10.0156L15.8639 1.62402C15.9358 1.53939 15.9718 1.43994 15.9718 1.32568C15.9718 1.1818 15.9125 1.05697 15.794 0.951172L15.4386 0.678223C15.3582 0.610514 15.2587 0.57666 15.1402 0.57666C14.9964 0.57666 14.8715 0.635905 14.7657 0.754395L8.6212 8.32715Z" fill="currentColor"></path></svg>';
                    messageElement.style.color = '#53bdeb'; 
                }
            
            }

        }
}

function moveToTop(userId){
    const chatList = document.getElementById('chatlist');
    const targetInside = document.querySelector(`.inside[data-user-id="${userId}"]`);

    if(chatList && targetInside){
        const block = targetInside.closest('.block');
        if (block) {
            chatList.prepend(block);
        }
        
        
    }
}

function ensureMediaPrefix(imageUrl){
    if(!imageUrl.startsWith("/media/")){
        imageUrl = "/media/" + imageUrl;
    }
    return imageUrl;
}


// functions 
function handleChathistory(data){

    const statusText = document.getElementById('statusText');
    is_online = data.status
    statusText.textContent = is_online ? "Online" : "Offline"; 

    if(data.sender_id == djangoUserId){

        data.history.forEach((day, index) => {
            lastDate = day.date; 
            const dateLabel = `
                <div class="date-label"  id="${day.date}">
                    <p>${day.date}</p>
                </div>
            `;

            const  rightChatbox =  document.querySelector('.rightside .chatBox');
            rightChatbox.insertAdjacentHTML('beforeend', dateLabel);

            day.messages.forEach((message) => {
                appendMessage(message);
            });
        
    
            setTimeout(() => {
                rightChatbox.scrollTop = rightChatbox.scrollHeight;
            }, 100);
        });
    }
 }     

 function setDuration(videoElement) {
    var uniqueId = videoElement.getAttribute('data-unique-id');
        var duration = videoElement.duration;
        var durationElement = document.getElementById(`videoDuration_${uniqueId}`);
        if(durationElement){
            const totalMinutes = Math.floor(duration / 60);
            const totalSeconds = Math.floor(duration % 60);
            const formattedTotal = `${totalMinutes}:${totalSeconds < 10 ? '0' : ''}${totalSeconds}`;
            durationElement.innerHTML = formattedTotal;
    
        }
}

function appendMessage(data){
    const isCheck_user = data.sender_id === Number(djangoUserId);

    
    let messageClass = isCheck_user ? 'sender' : 'receiver';
    let file_message_class = isCheck_user ? 'end_background' : 'start_background';
   
    let status_reply_deeper = isCheck_user? 'status_part_sender': 'status_part_reciver';
    let status_reply_line_color = isCheck_user ? 'status_part_left-line-sender' : 'status_part_left-line-reciver';
    let status_reply_text_color = isCheck_user ? 'span-text-sender' : 'span-text-reciver';

    let status_reply_name = isCheck_user ? `${data.reciver_name}` : 'You';
   
    const chatBoxs = document.querySelector('.rightside .chatBox');
    let messageElement = '';

   

    let messageStatusIcon = '';
    if(data.receiver_message_view == 'sent' && isCheck_user){ 
        messageStatusIcon =        
        `<span style="    display: flex;
                          color: white; 
                          margin-top: 2px;"class="message_${data.message_id}">
            <svg   viewBox="0 0 12 11" height="11" width="16" preserveAspectRatio="xMidYMid meet" class="" fill="none"><title>msg-check</title><path d="M11.1549 0.652832C11.0745 0.585124 10.9729 0.55127 10.8502 0.55127C10.7021 0.55127 10.5751 0.610514 10.4693 0.729004L4.28038 8.36523L1.87461 6.09277C1.8323 6.04622 1.78151 6.01025 1.72227 5.98486C1.66303 5.95947 1.60166 5.94678 1.53819 5.94678C1.407 5.94678 1.29275 5.99544 1.19541 6.09277L0.884379 6.40381C0.79128 6.49268 0.744731 6.60482 0.744731 6.74023C0.744731 6.87565 0.79128 6.98991 0.884379 7.08301L3.88047 10.0791C4.02859 10.2145 4.19574 10.2822 4.38194 10.2822C4.48773 10.2822 4.58929 10.259 4.68663 10.2124C4.78396 10.1659 4.86436 10.1003 4.92784 10.0156L11.5738 1.59863C11.6458 1.5013 11.6817 1.40186 11.6817 1.30029C11.6817 1.14372 11.6183 1.01888 11.4913 0.925781L11.1549 0.652832Z" fill="currentcolor"></path></svg>  
        </span>`

    }else if(data.receiver_message_view == 'delivered' && isCheck_user){
        messageStatusIcon =
        `<span style="    display: flex;
                          color: white; margin-top: 2px;" class="message_${data.message_id}">
            <svg viewBox="0 0 16 11" height="11" width="16" preserveAspectRatio="xMidYMid meet" class="" fill="none"><title>msg-dblcheck</title><path d="M11.0714 0.652832C10.991 0.585124 10.8894 0.55127 10.7667 0.55127C10.6186 0.55127 10.4916 0.610514 10.3858 0.729004L4.19688 8.36523L1.79112 6.09277C1.7488 6.04622 1.69802 6.01025 1.63877 5.98486C1.57953 5.95947 1.51817 5.94678 1.45469 5.94678C1.32351 5.94678 1.20925 5.99544 1.11192 6.09277L0.800883 6.40381C0.707784 6.49268 0.661235 6.60482 0.661235 6.74023C0.661235 6.87565 0.707784 6.98991 0.800883 7.08301L3.79698 10.0791C3.94509 10.2145 4.11224 10.2822 4.29844 10.2822C4.40424 10.2822 4.5058 10.259 4.60313 10.2124C4.70046 10.1659 4.78086 10.1003 4.84434 10.0156L11.4903 1.59863C11.5623 1.5013 11.5982 1.40186 11.5982 1.30029C11.5982 1.14372 11.5348 1.01888 11.4078 0.925781L11.0714 0.652832ZM8.6212 8.32715C8.43077 8.20866 8.2488 8.09017 8.0753 7.97168C7.99489 7.89128 7.8891 7.85107 7.75791 7.85107C7.6098 7.85107 7.4892 7.90397 7.3961 8.00977L7.10411 8.33984C7.01947 8.43717 6.97715 8.54508 6.97715 8.66357C6.97715 8.79476 7.0237 8.90902 7.1168 9.00635L8.1959 10.0791C8.33132 10.2145 8.49636 10.2822 8.69102 10.2822C8.79681 10.2822 8.89838 10.259 8.99571 10.2124C9.09304 10.1659 9.17556 10.1003 9.24327 10.0156L15.8639 1.62402C15.9358 1.53939 15.9718 1.43994 15.9718 1.32568C15.9718 1.1818 15.9125 1.05697 15.794 0.951172L15.4386 0.678223C15.3582 0.610514 15.2587 0.57666 15.1402 0.57666C14.9964 0.57666 14.8715 0.635905 14.7657 0.754395L8.6212 8.32715Z" fill="currentColor"></path></svg>
        </span>`
    } else if(data.receiver_message_view == 'seen' && isCheck_user){
       
        messageStatusIcon =
        `<span style="    display: flex;
                          color: #53bdeb; margin-top: 2px;" class="message_${data.message_id}">
            <svg viewBox="0 0 16 11" height="11" width="16" preserveAspectRatio="xMidYMid meet" class="" fill="none"><title>msg-dblcheck</title><path d="M11.0714 0.652832C10.991 0.585124 10.8894 0.55127 10.7667 0.55127C10.6186 0.55127 10.4916 0.610514 10.3858 0.729004L4.19688 8.36523L1.79112 6.09277C1.7488 6.04622 1.69802 6.01025 1.63877 5.98486C1.57953 5.95947 1.51817 5.94678 1.45469 5.94678C1.32351 5.94678 1.20925 5.99544 1.11192 6.09277L0.800883 6.40381C0.707784 6.49268 0.661235 6.60482 0.661235 6.74023C0.661235 6.87565 0.707784 6.98991 0.800883 7.08301L3.79698 10.0791C3.94509 10.2145 4.11224 10.2822 4.29844 10.2822C4.40424 10.2822 4.5058 10.259 4.60313 10.2124C4.70046 10.1659 4.78086 10.1003 4.84434 10.0156L11.4903 1.59863C11.5623 1.5013 11.5982 1.40186 11.5982 1.30029C11.5982 1.14372 11.5348 1.01888 11.4078 0.925781L11.0714 0.652832ZM8.6212 8.32715C8.43077 8.20866 8.2488 8.09017 8.0753 7.97168C7.99489 7.89128 7.8891 7.85107 7.75791 7.85107C7.6098 7.85107 7.4892 7.90397 7.3961 8.00977L7.10411 8.33984C7.01947 8.43717 6.97715 8.54508 6.97715 8.66357C6.97715 8.79476 7.0237 8.90902 7.1168 9.00635L8.1959 10.0791C8.33132 10.2145 8.49636 10.2822 8.69102 10.2822C8.79681 10.2822 8.89838 10.259 8.99571 10.2124C9.09304 10.1659 9.17556 10.1003 9.24327 10.0156L15.8639 1.62402C15.9358 1.53939 15.9718 1.43994 15.9718 1.32568C15.9718 1.1818 15.9125 1.05697 15.794 0.951172L15.4386 0.678223C15.3582 0.610514 15.2587 0.57666 15.1402 0.57666C14.9964 0.57666 14.8715 0.635905 14.7657 0.754395L8.6212 8.32715Z" fill="currentColor"></path></svg>
        </span>`
       
    }
    
    if(data.type_content == 'Photo'){
        
        let image_url = data.url;  

        messageElement = `<div class="message ${messageClass}" id="${data.message_id}"  receiver_id="${data.receiver_id}" data="${data.receiver_message_view}">
            <div class="mainImage ${file_message_class}">
            ${data.is_reply_status ?
                `<div class="status_part ${status_reply_deeper}">
                    <span class="status_part_left-line ${status_reply_line_color}"></span>
                    <div class="status_part_conntent">
                        <div class="status_part_conntent_wrap">
                            <div class="status_part_conntent_title">
                                <span class="${status_reply_text_color}">${status_reply_name} · Status</span>
                            </div>
                            <div class="status_part_conntent_title_bottom">
                                <div class="status_part_conntent_title_bottom_icon">
                                    <svg viewBox="0 0 16 20" height="20" width="16" preserveAspectRatio="xMidYMid meet" class="" version="1.1" x="0px" y="0px" enable-background="new 0 0 16 20"><title>status-image</title><path fill="currentColor" d="M13.822,4.668H7.14l-1.068-1.09C5.922,3.425,5.624,3.3,5.409,3.3H3.531 c-0.214,0-0.51,0.128-0.656,0.285L1.276,5.296C1.13,5.453,1.01,5.756,1.01,5.971v1.06c0,0.001-0.001,0.002-0.001,0.003v6.983 c0,0.646,0.524,1.17,1.17,1.17h11.643c0.646,0,1.17-0.524,1.17-1.17v-8.18C14.992,5.191,14.468,4.668,13.822,4.668z M7.84,13.298 c-1.875,0-3.395-1.52-3.395-3.396c0-1.875,1.52-3.395,3.395-3.395s3.396,1.52,3.396,3.395C11.236,11.778,9.716,13.298,7.84,13.298z  M7.84,7.511c-1.321,0-2.392,1.071-2.392,2.392s1.071,2.392,2.392,2.392s2.392-1.071,2.392-2.392S9.161,7.511,7.84,7.511z"></path></svg>
                                </div>
                                <span dir="auto" style="min-height: 0px; line-height: 23px;">Photo</span>
                            </div>
                        </div>
                    </div>
                    <div class="status_part_img">
                        <div class="status_part_img_first">
                            <div class="status_part_img_second" ><div class="status_part_imgview" style="background-image: url(${ensureMediaPrefix(data.url)});"> </div>
                            </div>
                        </div>
                    </div>
                </div>` 
                 
                :`<div class="first_view" onclick="playVideo('${image_url}', '${true}');">
                    <div class="innerImage">
                        <img src="${image_url}" class="image" alt="Image">
                    </div> 
                    ${!data.caption ?
                    `<div class="bottomContent">
                        <span class="vide_timestamp">${data.timestamp}</span>
                        ${messageStatusIcon}
                    </div>` : ''}
                </div>`}
                 
                ${data.caption ? 
                `<div class="caption">${data.caption}</div>  
                <div class="caption-bottom">
                            <span class="vide_timestamp">${data.timestamp}</span>
                            ${messageStatusIcon}
                </div>`: '' }          
            </div> 
        </div>`;
    }else if(data.type_content == 'Video'){
        
        const uniqueId = `video_${data.url.substring(data.url.lastIndexOf('/') + 1)}`;
       
        messageElement =   
        `<div class="message ${messageClass}" id="${data.message_id}" receiver_id="${data.receiver_id}" data="${data.receiver_message_view}">
                    <div class="mainImage ${file_message_class}"">
                        ${data.is_reply_status ?
                        `<div class="status_part ${status_reply_deeper}">
                            <span class="status_part_left-line ${status_reply_line_color}"></span>
                            <div class="status_part_conntent">
                                <div class="status_part_conntent_wrap">
                                    <div class="status_part_conntent_title">
                                        <span class="${status_reply_text_color}">${status_reply_name} · Status</span>
                                    </div>
                                    <div class="status_part_conntent_title_bottom">
                                        <div class="status_part_conntent_title_bottom_icon">
                                            <svg viewBox="0 0 16 20" height="20" width="16" preserveAspectRatio="xMidYMid meet" class="" version="1.1" x="0px" y="0px" enable-background="new 0 0 16 20"><title>status-video</title><path fill="currentColor" d="M15.243,5.868l-3.48,3.091v-2.27c0-0.657-0.532-1.189-1.189-1.189H1.945 c-0.657,0-1.189,0.532-1.189,1.189v7.138c0,0.657,0.532,1.189,1.189,1.189h8.629c0.657,0,1.189-0.532,1.189-1.189v-2.299l3.48,3.09 V5.868z"></path></svg>
                                        </div>
                                        <span dir="auto" style="min-height: 0px;line-height: 23px;margin-right: 3px;">00:32</span>
                                        <span dir="auto" style="min-height: 0px; line-height: 23px;">Video</span>
                                    </div>
                                </div>
                            </div>
                            <div class="status_part_img">
                                <div class="status_part_img_first">
                                    <div class="status_part_img_second" ><div class="status_part_imgview" style="background-image: url(${ensureMediaPrefix(data.url)});"> </div>
                                    </div>
                                </div>
                            </div>
                        </div>` 
                        :`<div class="first_view" onclick="playVideo('${data.url}', '${false}')">
                            <div class="playButton" id="playButton" >
                                <!-- Play Icon -->
                                <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" class="" version="1.1"><title>media-play</title><path d="M19.5,10.9 L6.5,3.4 C5.2,2.7 4.1,3.3 4.1,4.8 L4.1,19.8 C4.1,21.3 5.2,21.9 6.5,21.2 L19.5,13.7 C20.8,12.8 20.8,11.6 19.5,10.9 Z" fill="currentColor"></path></svg>
                            </div>
                            <video id="previewVideo_message" data-unique-id="${uniqueId}" muted onloadedmetadata="setDuration(this)">
                                <source id="MyDuration_${uniqueId}" src="${data.url}" type="video/mp4">
                            </video>  
                            <div class="media-loader">
                                <div class="loader"></div>
                            </div>
                            <div class="videoBottom space-between">
                            <span id="videoDuration_${uniqueId}" class="video-duration"></span>
                                ${!data.caption ?
                                    `<div  class="last-time">
                                        <span class="vide_timestamp">${data.timestamp}</span>
                                        ${messageStatusIcon}   
                                    </div>`:''}   
                            </div>
                    
                        </div>`}

                        ${data.caption ?
                        `<div class="caption">${data.caption}</div> 
                        <div class="caption-bottom">
                            <span class="vide_timestamp">${data.timestamp}</span>
                            ${messageStatusIcon}
                        </div>` : ''}
                    </div>
                </div>`;

    }else{
        messageElement = 
        `<div class="message ${messageClass}"  id="${data.message_id}" receiver_id="${data.receiver_id}" data="${data.receiver_message_view}">
            <div class="message_back">
                <div class="top-content">
                    <span>${data.content}</span>
                </div>
                <div class="bottom-content">
                    <span class="time">${data.timestamp}</span>
                    ${messageStatusIcon}
                </div>
            </div>
        </div>`;
    }    


    chatBoxs.insertAdjacentHTML('beforeend', messageElement); 
} 

function handleChatMessage(data){
    const chatBoxs = document.querySelector('.rightside .chatBox');
    const currentDate = data.label_time;
    const isCheck_user = data.sender_id === Number(djangoUserId);

       
    

    if(selectedUserId === data.receiver_id || selectedUserId == data.sender_id){
        if (lastDate !== currentDate) {
            chatBoxs.insertAdjacentHTML('beforeend', `
                <div class="date-label" id="${currentDate}">
                    <p>${currentDate}</p>
                </div>
            `);
            lastDate = currentDate;  
        }
        appendMessage(data);    
    }

    let emaplath = ''; 
    if(isCheck_user){
        moveToTop(data.receiver_id);
        emaplath = `.chatlist .block .inside[data-user-id="${data.receiver_id}"]`
    }else{
        moveToTop(data.sender_id);
        emaplath = `.chatlist .block .inside[data-user-id="${data.sender_id}"]`
    }

    if(emaplath !== ''){
        const userElements = document.querySelector(emaplath);
        if(userElements){
            const messagePElement = userElements.querySelector('.message_p p');
            if (data.type_content == 'Photo' && data.video_duration===''){
                messagePElement.textContent = 'Photo';
            }else if(data.type_content == 'Video' && data.video_duration===''){
                messagePElement.textContent = 'Video';
            }else{
                
                if(data.video_duration  === ''){
                    messagePElement.textContent = data.content; 
                }else{
                    messagePElement.textContent = data.caption;
                }
            } 
            const times = userElements.querySelector('.listHead p');
            times.textContent = data.timestamp;   
        }
    }

    if(!isCheck_user && Number(selectedUserId) !== data.sender_id){
        const userElements = document.querySelector(`.chatlist .block .inside[data-user-id="${data.sender_id}"]`);   
        if(userElements){
            const messagePElement = userElements.querySelector('.message_p');
            let toggleCountElement = messagePElement.querySelector('.toggle-count');
            
            if(toggleCountElement){
                toggleCountElement.textContent = data.toggle_count;
            }else{
                messagePElement.innerHTML += `<b class="toggle-count">${data.toggle_count}</b>`;
            }

        }
    }

    setTimeout(() => {
        chatBoxs.scrollTop = chatBoxs.scrollHeight;
    }, 100); 
 
}
  
function commenInput(){
    const message = messageInput.value;

    chatSocket.send(JSON.stringify({
        'action':'send_message',
        'message': message,
        'receiver_id': selectedUserId,
    }));

    messageInput.value = '';
    toggleSendIcon();
}   

// bluse tick 
const seenMessageIds  = new Set();
const observerReceiveMessage  = new IntersectionObserver((enteries) => {
    enteries.forEach(entry=>{
        if(entry.isIntersecting){
            const messageElement = entry.target;
            const data  = messageElement.getAttribute('data');
            const message_id = messageElement.getAttribute('id');
            if(data === 'delivered' && !seenMessageIds.has(message_id)){
                messageElement.setAttribute('data', 'seen');
                seenMessageIds.add(message_id);
                chatSocket.send(JSON.stringify({
                    'action': 'change_message_status_by_receiver',
                    'message_id':message_id,
                    'receiver_id': window.djangoUserId,
                }));


                const userElements = document.querySelector(`.chatlist .block .inside[data-user-id="${selectedUserId}"]`);   
                if(userElements){
                    const messagePElement = userElements.querySelector('.message_p');
                    let toggleCountElement = messagePElement.querySelector('.toggle-count');
                    
                    if(toggleCountElement){
                        toggleCountElement.textContent = toggleCountElement.textContent - 1;
                        if(toggleCountElement.textContent == 0){
                            toggleCountElement.style.display = 'none';
                        }
                    }
        
                }

                console.log("✅ Blue ticked for sender", messageElement.getAttribute('data'));
                observerReceiveMessage.unobserve(messageElement);
            }
        }
    });
}, {
    threshold:0.8,
});



const chatBox = document.getElementById('chatBox');

const mutationObserver = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
            if(node.nodeType === 1 && node.classList.contains('message') && node.classList.contains('receiver')){
                const data = node.getAttribute('data');
                const message_id = node.getAttribute('id');
                const  receiver_id= node.getAttribute('receiver_id');
                if(data === 'delivered' && !seenMessageIds.has(message_id) && receiver_id == window.djangoUserId){
                    observerReceiveMessage.observe(node);
                    console.log("🆕 New message added. Observing now...",data);
                }
                                           
            }
        });
    });
});

mutationObserver.observe(chatBox, {
    childList: true,
    subtree: true
});

function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
        return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    } else if (date > new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)) {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}


function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function saveContactsApi(email, contact_name){
    fetch('/create_contacts/',{
        method:'POST',
        header:{
            'Content-Type':'application/json',
            'X-CSRFToken':getCookie('csrftoken')
        },
        body:JSON.stringify({contact_email:email, contact_name:contact_name})
    }).then(response => response.json()).then(data=>{
        if(data.status == 200){
            draweEmailInput.value = '';
            adduserDrawer.classList.remove('open');
            getContacts('');
            common_SHOW_messages('success', `Contact save successfully......!`);
        }else{
            common_SHOW_messages('error', `${data.error}`);
    
        }
    }).catch(error => {
        common_SHOW_messages('error', `${error}`);
    });
}

function getContacts(query){
    fetch(`/get_contacts?q=${query}`,{
        method:'GET',
        header:{
            'Content-Type':'application/json',
            'X-CSRFToken':getCookie('csrftoken')
        },
    }).then(response => response.json()).then(data=>{
        drwerChatlist.innerHTML = '';
        

        data['data'].forEach(user =>{
            
            const userBlock = document.createElement('div');
            userBlock.className = 'drawer-block';
            userBlock.setAttribute('data-user-id', user.id);
            userBlock.innerHTML = `
                <div class="inside">
                    <div class="imgbox">
                        <img src="${user.profile_image != null ? user.profile_image : '/static/images/profile.png'}" class="cover"> 
                    </div>
                    <div class="details">
                        <div class="listHead">
                            <h4>${user.username}</h4>                        
                        </div>
                    </div>
                </div>
            `;
            
            drwerChatlist.appendChild(userBlock);

            const drawer_block = userBlock.querySelector('.drawer-block .inside');
            if(drawer_block){
                drawer_block.addEventListener('click',()=>{
                    leftsideDrawer.classList.remove('open');
                    const user_Block = document.querySelector(`.block .inside[data-user-id="${user.id}"]`);
                    
                    if(user_Block !== null){
                        if(!user_Block.classList.contains('active')){
                            document.querySelectorAll('.chatlist .block .inside').forEach(b => b.classList.remove('active'));
                            user_Block.classList.add('active');
        
                            if(selectedUserId == null){
                                rightSide_inside.style.display = 'contents';
                                introRight.style.display = 'none';
                            }
                            selectedUserId = user.id;
                
        
                            document.querySelector('.rightside .chatBox').innerHTML = '';
                            close_search_msg();
        
                            chatSocket.send(JSON.stringify({
                                'action': 'send_history',
                                'receiver_id': selectedUserId,
                            }));
                
                            document.querySelector('.rightside .userimg img').src = user.profile_image ? user.profile_image: '/static/images/profile.png';
                            document.querySelector('.rightside h4').innerHTML = `${user.username}<br><span id="statusText">online</span>`;
        
                        }
                    }else{
                        
                        const chatlist = document.getElementById('chatlist');
                       
                        const _id = user.id;
                        const url = user.profile_image ?user.profile_image: '/static/images/profile.png';
                        const username = user.username;

                        document.querySelectorAll('.chatlist .block .inside').forEach(b => b.classList.remove('active')); 
                        chatlist.innerHTML += `
                        <div class="block" >
                            <div class="inside active" data-user-id="${_id}">
                                <div class="imgbox">
                                    <img src="${url}" class="cover">                    
                                </div>    
                                <div class="details">
                                    <div class="listHead">
                                        <h4>${username}</h4>
                                        <p class="time"></p>
                                    </div>
                                    <div class="message_p">
                                            <p>"Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them. Click to learn more"</p>    
                                    </div>
                                </div>                        
                            </div>
                        </div>
                        `;

                        rightSide_inside.style.display = 'contents';
                        introRight.style.display = 'none';
                        selectedUserId = user.id;

                        console.log("i data got here", selectedUserId);
                        document.querySelector('.rightside .chatBox').innerHTML = '';
                        close_search_msg();
            
                        document.querySelector('.rightside .userimg img').src = user.profile_image ? user.profile_image: '/static/images/profile.png';
                        document.querySelector('.rightside h4').innerHTML = `${user.username}<br><span id="statusText">online</span>`;
                        
                        clickopenbox();
                        
                    }
                   
                });    
            }
            
        });
        
        
    }).catch(error => {
        console.error('Error:',error);
    });
}


function deleteContact(id){
    fetch(`/delete_contact/${id}/`,{
        method:'GET',
        header:{
            'Content-Type':'application/json',
            'X-CSRFToken':getCookie('csrftoken')
        },
    }).then(response => response.json()).then(data=>{
        if(data.status == 200){
            
            deleteDialog.style.display = 'none';
            const target_inside_block = document.querySelector(`.block .inside[data-user-id="${id}"]`);
            if(target_inside_block){
                target_inside_block.remove();

                rightSide_inside.style.display = 'none';
                introRight.style.display = 'flex';
                selectedUserId = null;
                lastDate = null;
    
                // document.querySelector('.rightside .chatBox').innerHTML = '';

                // document.querySelector('.rightside .userimg img').src = profileImage;
                // document.querySelector('.rightside h4').innerHTML = `${userName}<br><span id="statusText">online</span>`;
            }
        }
    }).catch(error => {
        console.error('Error:',error);
    });
} 


function clickopenbox(){
    const chatBlocksClick = document.querySelectorAll('.block .inside');
    chatBlocksClick.forEach(block=>attachChatBlockEvents(block));
   
}

function attachChatBlockEvents(block){
    block.addEventListener('contextmenu', function(e){
        e.preventDefault();

        const chat_USR_model = document.getElementById('chat_USR_model');
        chat_USR_model.style.left = `${e.pageX}px`;
        chat_USR_model.style.top = `${e.pageY}px`;
        chat_USR_model.style.display = 'block';

        const userId =  this.getAttribute('data-user-id');
        const userName = this.querySelector('.listHead h4').textContent;

        chat_USR_model.setAttribute('data-user-id', userId);
        chat_USR_model.setAttribute('data-user-name', userName);
               
    });

    block.addEventListener('click', function(){
    
        clearFiles();   
        document.querySelectorAll('.chatlist .block .inside').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
       
        if(selectedUserId == null){
            rightSide_inside.style.display = 'contents';
            introRight.style.display = 'none';
        }
        selectedUserId = this.getAttribute('data-user-id');

        document.querySelector('.rightside .chatBox').innerHTML = '';
        close_search_msg();
        
        chatSocket.send(JSON.stringify({
            'action': 'send_history',
            'receiver_id': selectedUserId,
        })); 

        const userId = this.getAttribute('data-user-id');
        const userName = this.querySelector('.listHead h4').textContent;
        const profileImage = this.querySelector('.imgbox img').src;

        document.querySelector('.rightside .userimg img').src = profileImage;
        document.querySelector('.rightside h4').innerHTML = `${userName}<br><span id="statusText">online</span>`;
    });
}

// status 24 hours  status delete functionality 
function status_update(uploaded_user_id,statusId){
    if(status_drawer_isOpen){
        status_data_get_On_button();
        if(check_statusview_isopen){
            if(uploaded_user_id == current_statusview_user_id){
                removeStatusById(statusId);
            }
        }
    }
}

function  removeStatusById(statusId){
    clearTimeout(animationTimeout); // Clear any ongoing animation
    isPlaying = false;

    
    const statusIndex = statuses.findIndex(status => status.id === Number(statusId));
    if (statusIndex === -1) {
        console.error('Status not found:', statusId);
        return;
    }
    

    statuses.splice(statusIndex, 1);
    statusesViewed.splice(statusIndex, 1);

    const statusViewBox_Calculation_lines = document.querySelector('.status-viewBox-top-calculation-lines');
    const statusLines = statusViewBox_Calculation_lines.querySelectorAll('.status-viewBox-top-calculation-line');
    const lineToRemove = statusLines[statusIndex];



    
    if (lineToRemove) {
        lineToRemove.remove();
    }

    statusViewBox_Calculation_lines.innerHTML = '';


   
    statuses.forEach((element, index)=>{
        const statusLine = document.createElement('div');
        statusLine.classList.add('status-viewBox-top-calculation-line');

        const lineTop = document.createElement('div');
        lineTop.classList.add('status-viewBox-top-calculation-line-top');
        statusLine.appendChild(lineTop);

        const lineBottom = document.createElement('div');
        lineBottom.classList.add('status-viewBox-top-calculation-line-bottom');

        const lineBottomTop = document.createElement('div');
        lineBottomTop.classList.add('status-viewBox-top-calculation-line-bottom-top');
        lineBottomTop.textContent = element.statusText || "No status";

        lineBottom.appendChild(lineBottomTop);
        statusLine.appendChild(lineBottom);

        statusViewBox_Calculation_lines.appendChild(statusLine);
        
    });
   
    
    
    if(currentStatusIndex >= statuses.length){
        currentStatusIndex = statuses.length - 1; 
    } else  if (currentStatusIndex > statusIndex) {
        currentStatusIndex -= 1; // Move to the previous index
    }    
   
    const status_bototm_Lines = document.querySelectorAll('.status-viewBox-top-calculation-line-bottom-top');
    
    for(let k =0; k < currentStatusIndex; k++){
        const currentLine = status_bototm_Lines[k];
        currentLine.style.width = '100%';
        currentLine.style.transition = 'none';
        currentLine.offsetWidth;
    }
   

    playAllStatuses(); 
    if (statuses.length === 0){
        close_status_view();
    }
}

const search_messages = document.getElementById('search_messages');
const message_search_side = document.getElementById('message_search_side');
const message_side_close = document.getElementById('message_side_close');

const message_search_icon = document.getElementById('message_search_icon');
const message_search_right_arrow = document.getElementById('message_search_right_arrow');
const message_search_input = document.getElementById('message_search_input');
const message_search_close = document.getElementById('message_search_close');

const search_data = document.getElementById('search_data');
const suggestion_text_show = document.getElementById('suggestion_text_show');
const noResultsMessage = document.getElementById('noResultsMessage');


search_messages.addEventListener('click', function(){
    message_search_side.style.display = 'block';
    message_search_icon.style.display = 'none';
    if(message_search_input){
        message_search_input.focus();
    }
    message_search_close.style.display = 'none';
    
});

message_side_close.addEventListener('click', function(){
    close_search_msg();
});

function close_search_msg(){
    message_search_side.style.display = 'none';
    message_search_input.value = '';
    search_data.innerHTML = '';
    suggestion_text_show.style.display = 'flex';
    noResultsMessage.textContent  =  "Search for messages with Shraddha Mami.";
}

message_search_input.addEventListener('input', function(){
    
    message_search_close.style.display = '';
    message_search_right_arrow.style.display = '';
    message_search_icon.style.display =  'none';
    if(message_search_input.value.trim() === ''){
        message_search_close.style.display = 'none';
    }

    const filter = message_search_input.value.toLowerCase();
    search_data.innerHTML = '';

   
    if(message_search_input.value.trim() !== ''){

        suggestion_text_show.style.display = 'none';

        chat_history_search_MSG['history'].slice().reverse().forEach(chat=>{
            chat.messages.slice().reverse().forEach(message => {                
                const date = chat.date;
                const content = message.content ? message.content.toLowerCase() : "";
                const caption = message.caption ? message.caption.toLowerCase() : "";
                
                if (content.includes(filter) || caption.includes(filter)) {

                    const highlightedContent = message.content 
                    ? message.content.replace(new RegExp(filter, 'gi'), match => `<span class="content_span_highlight">${match}</span>`) 
                    : "";
                    const highlightedCaption = message.caption 
                        ? message.caption.replace(new RegExp(filter, 'gi'), match => `<span class="content_span_highlight">${match}</span>`) 
                        : "";

                    search_data.innerHTML += `
                    <div class="blocks">
                       <div class="block_inside" data-message-id="${message.message_id}">
                            <div class="date">
                                <span>${date}</span>
                            </div>
                            <div class="content">
                            ${highlightedContent !== "" ? highlightedContent :highlightedCaption}
                            </div>
                        </div>
                        
                    </div>`;

            
                }

            });
        });
        
        if (search_data.innerHTML.trim() === '' && message_search_input.value.trim() !== '') {
            suggestion_text_show.style.display = 'flex';
            noResultsMessage.textContent  =  "No messages found";
        } else {
            suggestion_text_show.style.display = 'none';
        }
        
       
    }else{
        suggestion_text_show.style.display = 'flex';
        noResultsMessage.textContent  =  "Search for messages with Shraddha Mami.";
    }
   


});

search_data.addEventListener('click', function(event) {
    const block = event.target.closest('.block_inside');
    if(block){
        const messageId = block.getAttribute('data-message-id');
        const messageElement = document.getElementById(messageId);
        if (messageElement) {
            messageElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
    }
});

message_search_input.addEventListener('focus', function(){
    message_search_right_arrow.style.display = '';
    message_search_icon.style.display =  'none';
    
});

message_search_input.addEventListener('focusout',function(){
    if(message_search_input.value.trim() === ''){
        message_search_close.style.display = 'none';
        message_search_right_arrow.style.display = 'none';
        message_search_icon.style.display =  '';
    }
});

message_search_close.addEventListener('click', function(){    
    message_search_input.value = '';
    message_search_close.style.display = 'none';
    if(message_search_input){
        message_search_input.focus();
    }
});


let calender = document.getElementById("calender");
let toggle_Calendar = document.getElementById("toggle_Calendar");

toggle_Calendar.addEventListener("click", function(event){
    if(calender.classList.contains("show")){
        calender.classList.remove("show");  
    }else{
        calender.classList.add("show");
    }
    event.stopPropagation();
});

document.addEventListener("click", function (event) {
    if (!calender.contains(event.target) && event.target !== toggle_Calendar) {
        calender.classList.remove("show");
    }
    const msG = document.getElementById('chat_USR_model');
    if(msG){
        msG.style.display = 'none';
    }
    
    
});


function common_SHOW_messages(status, text){
    const messageBox = document.querySelector('.messages');
    const messageText = document.querySelector('.messages .discou');

    messageBox.style.animation = 'none';
    void messageBox.offsetWidth;
    messageBox.classList.remove('success', 'error');
    
    messageBox.classList.add(status);
    messageText.textContent = text;

    messageBox.style.display = 'block'

    setTimeout(()=>{
        messageBox.style.animation = 'fadeOut 0.5s ease-in-out forwards';
        setTimeout(()=>{
            messageBox.style.display = 'none';
        }, 500);
    }, 5000);
}

// video call 
// const localVideo = document.getElementById("localVideo");
// const remoteVideo = document.getElementById("remoteVideo");

// const peer = new RTCPeerConnection();

// function sendWhenSocketReady(data) {
//     if (chatSocket.readyState === WebSocket.OPEN) {
//         chatSocket.send(JSON.stringify(data));
//     } else {
//         chatSocket.addEventListener("open", () => {
//             chatSocket.send(JSON.stringify(data));
//         }, { once: true });
//     }
// }

// navigator.mediaDevices.getUserMedia({
//     video: true,
//     audio: { 
//         echoCancellation: true,
//         noiseSuppression: true,
//         autoGainControl: true,
//         channelCount: 1,
//         sampleRate: 48000, 
//         sampleSize: 16
//     }
// }).then(stream => {
//     localVideo.srcObject = stream;
//     stream.getTracks().forEach(track => peer.addTrack(track, stream));
// });

// peer.ontrack = (event) => {
   
//     if (event.track.kind === "video") {
//         remoteVideo.srcObject = event.streams[0];
//     } else if (event.track.kind === "audio") {
//         document.getElementById("remoteAudio").srcObject = event.streams[0];
//     }
// };

// peer.onicecandidate = event => {
//     sendWhenSocketReady({
//         action: "new_ice_candidate",
//         receiver_id: 43,
//         candidate: event.candidate
//     });
// };


// chatSocket.addEventListener("open", () => {
//     peer.createOffer().then(offer => {
//         peer.setLocalDescription(offer);
//         if (window.djangoUserId !== '43') {
//             chatSocket.send(JSON.stringify({
//                 action: "video_offer",
//                 receiver_id: 43,
//                 offer: offer
//             }));
//         }
//     });
// });

// chatSocket.onmessage = async ({ data }) => {
//     const msg = JSON.parse(data);
//     console.log("msg===============",msg);
//     switch (msg.type){

//         case "video_offer":
//             await peer.setRemoteDescription(new RTCSessionDescription(msg.offer));
//             const answer = await peer.createAnswer();
//             await peer.setLocalDescription(answer);
//             sendWhenSocketReady({
//                 action: "video_answer",
//                 receiver_id: msg.sender_id,   
//                 answer: answer
//             });
//             break;

//         case "video_answer":
//             await peer.setRemoteDescription(new RTCSessionDescription(msg.answer));
//             break;

//         case "new_ice_candidate":
//             try {
//                 await peer.addIceCandidate(new RTCIceCandidate(msg.candidate));
//             } catch (e) {
//                 console.error("Error adding received ice candidate", e);
//             }
//             break;    

              
//     }

// }