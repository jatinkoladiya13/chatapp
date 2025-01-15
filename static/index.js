const messageInput = document.getElementById('messageInput');
const micIcon = document.getElementById('micIcon');
const sendIcon = document.getElementById('sendIcon');
const searchInput = document.getElementById('search-input');
const searchClose = document.getElementById('search-close');
const chatlist = document.getElementById('chatlist');
const chatBlocks = chatlist.getElementsByClassName('block');
const introRight = document.querySelector('.intro-right');
const rightSide = document.querySelector('.rightside');
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
const drwerChatlist  = document.querySelector('.drwer-chatlist');
const drawerSearchInput = document.getElementById('drawer-search-input');
const drwerSearchClose = document.getElementById('drawer-search-close');
const plusUpload = document.getElementById('plusUpload');
const plusUploadClose = document.getElementById('plusUploadClose');
const plusDropdown = document.getElementById('plus-dropdown-menu');
const imageViewer = document.getElementById('imageViewer');
const imagePreviewContainer = document.getElementById('imagePreviewContainer');
const imagePreviewClose = document.getElementById('imagePreviewClose');
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
    searchClose.style.display = searchInput.value.trim() === '' ? 'none' : 'block';   
});

searchClose.addEventListener('click', () => {
    searchInput.value = '';
    searchClose.style.display = 'none';  
    searchInput.focus();
    searchInput.dispatchEvent(new Event('input')); 
});
    
   
window.onload = function(){
    rightSide.style.display = 'none';
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

confirmDelete.addEventListener('click',()=>{
    const userId = deleteDialog.getAttribute('data-user-id');
    if(userId){
        
        deleteContact(userId);
    }   
});

saveButton.addEventListener('click',()=>{
    if(draweEmailInput.value.trim() != ''){
        
         saveContactsApi(draweEmailInput.value);
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
        drwerSearchClose.style.display = 'block'; 
    } 
});

drwerSearchClose.addEventListener('click', () => {
    drawerSearchInput.value = '';
    drwerSearchClose.style.display = 'none';  
    drawerSearchInput.focus();
}); 


plusUpload.addEventListener('click', ()=>{
    plusUpload.style.display = 'none';
    plusUploadClose.style.display = 'block';
    plusDropdown.style.cssText = `
        display: block;
        transform: translateY(0);
        opacity: 1;
    `;  
});

plusUploadClose.addEventListener('click', ()=>{
    plusUpload.style.display = 'block';
    plusUploadClose.style.display = 'none';
    plusDropdown.style.cssText = `
        display: none;
        transform: translateY(0);
        opacity: 1;
    `; 
});

document.addEventListener('click',function(event){
    if(!plusDropdown.contains(event.target) && !plusUpload.contains(event.target)){
        plusDropdown.style.cssText = `
            display: none;
            transform: translateY(0);
            opacity: 1;
        `;
        plusUpload.style.display = 'block';
        plusUploadClose.style.display = 'none';

    } 
});

imagePreviewClose.addEventListener('click',()=>{
    clearImages(); 
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

topheaderAddStatus.addEventListener('click', function(event){
    topheaderAddStatus.style.background = "rgba(255, 255, 255, .1)";
    smallDrawerStatus.style.cssText = `transform-origin: right top;
    right: 74px;
    top: 56.5px;
    transform: scale(1);
    display:flex;`;
    scrollableContent.style.overflowY = "hidden";
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
    display:flex;`;
    scrollableContent.style.overflowY = "hidden";
    event.stopPropagation();
});

// take photo and video for status and viewed 
const imgPreviewContainers = document.getElementById('imgPreview-containers');
const closeStausImgandVidPreview = document.getElementById('closeStausImgandVidPreview');

closeStausImgandVidPreview.addEventListener('click', function(){
    imgPreviewContainers.style.display ="none";
    statusFileIndexCounter = 0;
    fileBlobs = [];
});

let statusFileIndexCounter = 0;
let fileBlobs = [];

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
            // Set canvas size to match the video's dimensions
            canvasElement.width = videoElement.videoWidth;
            canvasElement.height = videoElement.videoHeight;

            // Draw the current frame of the video onto the canvas
            context.drawImage(videoElement, 0, 0, videoElement.videoWidth, videoElement.videoHeight);

            // Convert the canvas content to a Data URL (base64 string)
            const thumbnailDataUrl = canvasElement.toDataURL('image/png');

            // Clean up and revoke the blob URL
            URL.revokeObjectURL(videoURL);

            // Resolve the thumbnail image Data URL
            resolve(thumbnailDataUrl);
        });

        videoElement.addEventListener('error', (e) => {
            reject(new Error('Error loading video file for thumbnail extraction.'));
        });
    });
}

//  this function check video or image
function isCheckLogic(result, checkIsVideo){
    const statusTakePrviews = document.querySelector(".status-take-file-previews");
    let file_tag = ``;
    statusTakePrviews.innerHTML = "";

    if (checkIsVideo) {
        file_tag = `
        <video id="statuspreviewFile" controls>
            <source src=${result} type="video/mp4">
        </video>`;
    } else {
        file_tag = `<img id="statuspreviewFile" src=${result} alt="Image Preview">`;
    }
    statusTakePrviews.insertAdjacentHTML('beforeend', file_tag);
}

function readFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve({ result: e.target.result, file });
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}


// input tage fille onchange called this function 
function handlePhotoAndVideoCapture(event){
    const files = event.target.files;
    
    const total_status_limit = my_status_count + files.length;
    if(total_status_limit > 25){
        alert(`You can only upload a maximum of 25 statuses. Please reduce your selection.`);
        return;
    }
    

    

    const  statusMutipleFile  = document.querySelector('.status_preview_bottoms .send-images .status-multiple-files');
    const statusCaptionInput = document.getElementById("status-caption-input");
    const statusCaptionClose = document.getElementById("status-caption-close");
    
   
    const isFirstUpload = statusMutipleFile.innerHTML.trim() === '';
   

    if(isFirstUpload){
        statusFileIndexCounter = 0;  
        fileBlobs = [];  
        statusCaptionInput.value="";
        statusCaptionInput.setAttribute('data-index', '0');
    }

    const filePromises  = Array.from(event.target.files).map((file)=>{

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
                video.onloadedmetadata = function() {

                    if(video.duration > 30){
                        alert(`The video file "${file.name}" duration must be less than or equal to 30 seconds.`);
                        return resolve(null);
                    }

                    readFile(file).then(resolve).catch(reject);
                }
            } else{
                readFile(file).then(resolve).catch(reject);
            }
          

          
           
            
        });
    }).filter((promise) => promise !== null);

    Promise.all(filePromises).then((fileDataArray)=>{
        fileDataArray.filter((fileData) => fileData !== null).forEach( ({result, file }) => {
            const isVideo = file.type.startsWith('video/');
            let imgTeg;
            
            if (isVideo) {
                extractVideoThumbnail(file).then(thumbnailDataUrl => {
                    imgTeg = `
                        <button class="status_Multiple_File_Btn" data-index="${statusFileIndexCounter}" data-caption="" data-src="${result}">
                            <div class="first">
                                <ion-icon name="close-outline" id="st-removeFile"></ion-icon>
                            </div>
                            <div class="second">
                                <img alt="Video Thumbnail" class="cover" src="${thumbnailDataUrl}">
                            </div>
                        </button>
                    `;

                    // thumbnailDataurl convert to file
                    const byteString = atob(thumbnailDataUrl.split(',')[1]);
                    const arrayBufferr = new ArrayBuffer(byteString.length);
                    const uint8Array = new Uint8Array(arrayBufferr);
                    
                    for(let i=0; i<byteString.length; i++){
                        uint8Array[i] = byteString.charCodeAt(i);
                    }

                    const blob = new Blob([uint8Array], {type: 'image/png'});
                    const background_file = new File([blob], 'thumbnail.png', { type: 'image/png' });
   

                    statusMutipleFile.insertAdjacentHTML('beforeend', imgTeg);
                    fileBlobs.push({
                        file: file,
                        background_file:background_file,
                        index: statusFileIndexCounter,
                        type: true,
                    }); 
    
                    if (statusFileIndexCounter === 0 && isFirstUpload) {
                        isCheckLogic(result, true);
                    }

                    statusFileIndexCounter++;
                });
            } else {
                imgTeg = `
                    <button class="status_Multiple_File_Btn" data-index="${statusFileIndexCounter}" data-caption="">
                        <div class="first">
                            <ion-icon name="close-outline" id="st-removeFile"></ion-icon>
                        </div>
                        <div class="second">
                            <img alt="Preview" class="cover" src="${result}">
                        </div>
                    </button>
                `;
                statusMutipleFile.insertAdjacentHTML('beforeend', imgTeg);
                fileBlobs.push({
                    file: file,
                    index: statusFileIndexCounter,
                    type:false,
                }); 

                if (statusFileIndexCounter === 0 && isFirstUpload) {
                    isCheckLogic(result, false);
                } 

                statusFileIndexCounter++;
            }
           
             
           

        });
    });
    imgPreviewContainers.style.display ="flex";

    //  this is bottom click change privewe and remove 
    const observer = new MutationObserver(()=>{
        const status_Multiple_File_Btn = document.querySelectorAll('.status_Multiple_File_Btn');

        if(isFirstUpload){
            status_Multiple_File_Btn[0].classList.add('selected');
            const caption = status_Multiple_File_Btn[0].getAttribute('data-caption');
            statusCaptionInput.value = caption || '';
        
        }

        const statusMutipleFile = document.querySelector('.status_preview_bottoms .send-images .status-multiple-files');
        statusMutipleFile.addEventListener('click', function(event){
            if(event.target.closest('#st-removeFile')){
                const button = event.target.closest('.status_Multiple_File_Btn');
                if(button){
                    const isSelected = button.classList.contains('selected');
                   
                    button.remove();

                    const dataIndex = button.getAttribute('data-index');
                    const indexToRemove = parseInt(dataIndex);
                    fileBlobs.splice(indexToRemove, 1);

                    const remainingButtons = document.querySelectorAll('.status_Multiple_File_Btn');
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
                            statusCaptionInput.value = caption || '';
                            statusCaptionInput.setAttribute('data-index',  remainingButtons[0].getAttribute('data-index'));
                        }

                    }else{
                        imgPreviewContainers.style.display ="none";
                    }

                }
            }else if(event.target.closest('.status_Multiple_File_Btn')){
                const clickedButton = event.target.closest('.status_Multiple_File_Btn');
                const status_Multiple_File_Btn = document.querySelectorAll('.status_Multiple_File_Btn');

                status_Multiple_File_Btn.forEach(item => item.classList.remove('selected'));
                clickedButton.classList.add('selected');

                const imgElement = clickedButton.querySelector('img');
                const dataSrc = clickedButton.getAttribute('data-src');
                if(dataSrc){
                    isCheckLogic(dataSrc, true);
                }else{
                    isCheckLogic(imgElement.src, false);
                }
                
        
                const caption = clickedButton.getAttribute('data-caption');
                const statusCaptionInput = document.getElementById("status-caption-input");
                statusCaptionInput.value = caption || '';
                statusCaptionInput.setAttribute('data-index', clickedButton.getAttribute('data-index'));
            }
        });

    


        observer.disconnect();
    });

    observer.observe(statusMutipleFile, { childList: true });
    
    // this is caption input access
    statusCaptionInput.addEventListener('input', function(){
        const selectedIndex = this.getAttribute('data-index');
        const selectedImageButton = document.querySelector(`.status_Multiple_File_Btn[data-index="${selectedIndex}"]`);
        if(selectedImageButton){
            selectedImageButton.setAttribute('data-caption', this.value);   
        }
    });

    // this is caption close icon click
    statusCaptionClose.addEventListener('click', function(){
        
        const selectedIndex = statusCaptionInput.getAttribute('data-index');
        const selectedImageButton = document.querySelector(`.status_Multiple_File_Btn[data-index="${selectedIndex}"]`);

        if(selectedImageButton){
            statusCaptionInput.value = '';
            selectedImageButton.setAttribute('data-caption', '');
        }
    });
   
}

//  status upload send button click with called api function
const statusUploadSend = document.getElementById('status_upload_send');
const profile_Status_Second_details = document.getElementById('profile_Status_Second_details');

statusUploadSend.addEventListener('click', function(event){
 
    if(fileBlobs.length > 0){
       
        fileBlobs.forEach( async (status_file, index) => {
            const formDate = new FormData();
    
           
            if(status_file.type){
                formDate.append('video', status_file.file);
                formDate.append('background_img', status_file.background_file);
            }else{
                formDate.append('image', status_file.file);
            }

            const file_catption_get = document.querySelector(`.status_Multiple_File_Btn[data-index="${status_file.index}"]`);
            const caption =  file_catption_get ? file_catption_get.getAttribute('data-caption') : '';
            formDate.append('caption', caption);  

            
          
            await statusFileSenToApi(formDate, index);

        });
          
    }
});

//  upload api function 
async function statusFileSenToApi(formatDate, index){
    try{
        const response = await fetch('/upload_status/',{
            method:'POST',
            header:{
                'Content-Type':'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: formatDate,
        });
        
    
        if(response.ok){
            const data = await response.json();
            let checking = fileBlobs.length-1;
            
            if(checking === index){
                fileBlobs=[];
                topheaderProfile_Status_Second.style.display = 'flex';
                topheader_Profile_Status.style.display = 'none';  
                document.querySelector('.status_preview_bottoms .send-images .status-multiple-files').innerHTML = '';     
            }

            profile_Status_Second_details.textContent = data.message['Upload_time']; 
            my_status_count = data.message.total_count_status;
            statusCountViewedAndUnviewed_lines("Unviewed", "Viewed", data.message.total_count_status, data.message.unviewed_count);
            imgPreviewContainers.style.display ="none";

            chatSocket.send(JSON.stringify({
                'action':'uploade_status',
                'uploaded_user_id': data.user_id,
                'status_id':data.message.id,  
                'uploaded_users_contacts':data.user_contacts, 
            }));

        }else{
            console.error("Failed to update profile. Status:", response.status);
        }
    }catch(error){
        console.error("Error:",error);
    }
}


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

function clearImages(){
    imagePreviewContainer.style.display = 'none';
    chat_box.style.display = 'block';
    chat_box_input.style.display = 'flex';
    
    const multipleImg = document.querySelector('.preview_bottom .send-images .multiple-image');
    multipleImg.innerHTML = '';
    
    const imagePreview = document.querySelector(".image-preview");
    imagePreview.innerHTML = '';

    const check_input = document.getElementById('addmoreImg');
    if(check_input){
        check_input.remove();
    }
}

function closeDrawandOpenImgView(){
    plusDropdown.style.cssText = `
            display: none;
            transform: translateY(0);
            opacity: 1;
        `; 
        
    chat_box.style.display = 'none';
    chat_box_input.style.display = 'none';
    imagePreviewContainer.style.display = 'flex';
}

let imageIndexCounter = 0;
let imageSave = [];

function handlePhotoCapture(event){
    const files = event.target.files;

    if(files){
        startLoading();          
        closeDrawandOpenImgView();

        const  mutipleImg  = document.querySelector('.preview_bottom .send-images .multiple-image');
        const imagePreview = document.querySelector(".image-preview");
        const button = document.querySelector('.imgAddBtn');
        const captionInput = document.getElementById('captinoInput');
        const captionClose = document.getElementById('caption-close');

        const isFirstUpload = mutipleImg.innerHTML.trim() === '';
        if(isFirstUpload){
            imageIndexCounter = 0; 
            imageSave = [];  
            imagePreview.insertAdjacentHTML('beforeend',  `<img id="previewImage" src="" alt="Image Preview">`);
            const fileInput  = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'addmoreImg';
            fileInput.accept = 'image/*';
            fileInput.multiple = true;
            fileInput.style.display = 'none';
            fileInput.onchange = handlePhotoCapture;
            button.appendChild(fileInput); 

            mutipleImg.innerHTML = '';
            const readerFirst = new FileReader()
            readerFirst.onload = function(e){
                const previewImage = document.getElementById('previewImage');
                previewImage.src = e.target.result;
            };
            readerFirst.readAsDataURL(files[0]);

            captionInput.value = '';
            captionInput.setAttribute('data-index', '0');
        }
        
        


        Array.from(files).forEach((file, index)=>{
            
          

            const readerMultiple = new FileReader();
            readerMultiple.onload = function(e){
                imageIndexCounter++;
                const imgTeg = `
                    <button class="multipleImgBtn" data-index="${imageIndexCounter}" data-caption="">
                        <div class="first">
                            <ion-icon name="close-outline"  id="removeImg"></ion-icon>
                        </div>
                        <div class="second">
                            <img alt="Preview" class="cover" src=${e.target.result}>
                        </div>
                    </button>
                `;
                mutipleImg.insertAdjacentHTML('beforeend', imgTeg); 
                if (index === files.length) {
                    stopLoading();
                }
                imageSave.push({
                    file: file,
                    index: imageIndexCounter,
                });
            };  
            readerMultiple.readAsDataURL(file);
          
        });
          
        setTimeout(()=>{
            const multipleImgBtn = document.querySelectorAll('.multipleImgBtn');
            if(isFirstUpload){
                multipleImgBtn[0].classList.add('selected');
                const caption = multipleImgBtn[0].getAttribute('data-caption');
                captionInput.value = caption || '';
                captionInput.setAttribute('data-index', 1);
            }

            multipleImgBtn.forEach(element => {
                element.addEventListener('click',function (){
                    multipleImgBtn.forEach(item =>{
                        
                        item.classList.remove('selected');
                    });

                   
                    this.classList.add('selected');

                    const imgElement = this.querySelector('img');
                    const previewImage = document.getElementById('previewImage');
                    previewImage.src = imgElement.src;

                    const caption = this.getAttribute('data-caption');
                    captionInput.value = caption || '';
                    captionInput.setAttribute('data-index', this.getAttribute('data-index'));

                });
                const removeImg = element.querySelector('#removeImg');
                removeImg.addEventListener('click',function(e){
                   e.stopPropagation();
                   
                   const isSelected = element.classList.contains('selected');
                   
                   element.remove();

                   const dataIndex = element.getAttribute('data-index');
                   const indexToRemove = parseInt(dataIndex);
                   imageSave.splice(indexToRemove, 1);

                   const remainingItems = document.querySelectorAll('.multipleImgBtn');
                   if(remainingItems.length > 0){
                      if(isSelected){
                        remainingItems[0].classList.add('selected');
                        const imgElement = remainingItems[0].querySelector('img');
                        const previewImage = document.getElementById('previewImage');
                        previewImage.src = imgElement.src;

                        const caption  = remainingItems[0].getAttribute('data-caption');
                        captionInput.value = caption || '';
                        captionInput.setAttribute('data-index',  remainingItems[0].getAttribute('data-index'));
                      }
                   }else{
                        imagePreviewContainer.style.display = 'none';
                        chat_box.style.display = 'block';
                        chat_box_input.style.display = 'flex';
                        plusUpload.style.display = 'block';
                        plusUploadClose.style.display = 'none';

                   }
                });
            });
        }, 100);

        commonCaption();


        event.target.value = ''; 
    }
}

function commonCaption(){
    captionInput.addEventListener('input', function(){
        const selectedIndex = this.getAttribute('data-index');
        const selectedImageButton = document.querySelector(`.multipleImgBtn[data-index="${selectedIndex}"]`);
        if(selectedImageButton){
            selectedImageButton.setAttribute('data-caption', this.value);   
        }
    });

    captionClose.addEventListener('click', function(){
        const selectedIndex = captionInput.getAttribute('data-index');
        const selectedImageButton = document.querySelector(`.multipleImgBtn[data-index="${selectedIndex}"]`);

        if(selectedImageButton){
            captionInput.value = '';
            selectedImageButton.setAttribute('data-caption', '');
        }
    });
}

let videoIndexCounter = 0;
let videoBlobs = []; 

const captionInput = document.getElementById('captinoInput');
const captionClose = document.getElementById('caption-close');

async function handleVideoCapture(event){
    const files = event.target.files;
    const minimumSizeMB = 64;
    const minimumSizeBytes = minimumSizeMB * 1048576;
    if(files){
        
        for (const file of files) {
            if (file.size >= minimumSizeBytes) {
                alert(`Video size must be at least ${minimumSizeMB} MB. The file '${file.name}' is too small.`);
                return;
            }
        }
        startLoading();  
        closeDrawandOpenImgView();
        const  mutipleImg  = document.querySelector('.preview_bottom .send-images .multiple-image');
        const imagePreview = document.querySelector(".image-preview");
        const button = document.querySelector('.imgAddBtn');
        const isFirstUpload = mutipleImg.innerHTML.trim() === '';
        

        if(isFirstUpload){
            videoIndexCounter = 0;
            videoBlobs = [];
            const fileInput  = document.createElement('input');
            fileInput.type = 'file';
            fileInput.id = 'addmoreImg';
            fileInput.accept = 'video/mp4,video/3gpp,video/quicktime';
            fileInput.multiple = true;
            fileInput.style.display = 'none';
            fileInput.onchange = handleVideoCapture;
            button.appendChild(fileInput); 


            const videoTag = `
                <video id="previewVideo" controls>
                    <source src="" type="video/mp4">
                </video> 
            `;
            
            imagePreview.insertAdjacentHTML('beforeend',  videoTag);

            captionInput.value = '';
            captionInput.setAttribute('data-index', '0');
        }
        
       
        for (let index = 0; index < files.length; index++) {
            
            await processFile(files[index], index, isFirstUpload);
            videoIndexCounter++;
        }
        
        stopLoading();  
        setTimeout(()=> attachThumbnailListeners(),500);

       
        event.target.value = ''; 
    }
}

function processFile(file, index, isFirstUpload) {
    const  mutipleImg  = document.querySelector('.preview_bottom .send-images .multiple-image');
    return new Promise((resolve) => {
        const readerMultiple = new FileReader();
        readerMultiple.onload = function(e) {
            const videoBlob = e.target.result;
            const video = document.createElement('video');
            video.src = videoBlob;
            video.muted = true;
            video.preload = 'metadata';
            
            video.addEventListener('loadeddata', () => {
                if (video.readyState >= 2) {
                    video.currentTime = 0;
                    setTimeout(() => {
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.width = 600; 
                        canvas.height = 400; 
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);

                        const thumbnailDataUrl = canvas.toDataURL('image/jpeg');
                        if (thumbnailDataUrl) {
                            const videoTag = `
                                <button class="multipleImgBtn" data-src="${videoBlob}" data-file="${file}" data-index="${videoIndexCounter}" data-caption="">
                                    <div class="first">
                                        <ion-icon name="close-outline" class="removeImg" id="removeImg"></ion-icon>
                                    </div>
                                    <div class="second">
                                        <img src="${thumbnailDataUrl}" width="100" height="75" alt="Video Thumbnail" />
                                    </div>
                                </button>
                            `;
                            mutipleImg.insertAdjacentHTML('beforeend', videoTag);
                            videoBlobs.push({
                                file: file,
                                index: videoIndexCounter
                            });
                            if (index === 0 && isFirstUpload) {
                                const multipleImgBtn = document.querySelector('.multipleImgBtn[data-index="0"]');    
                                multipleImgBtn.classList.add('selected');
                                const previewVideo = document.getElementById('previewVideo');
                                previewVideo.src = videoBlob;
                                previewVideo.load();
                            }
                            
                        } else {
                            console.error('Failed to generate thumbnail for video:', file.name);
                        }
                        resolve();
                    }, 500);
                }
            }, { once: true });
            video.play().then(() => video.pause());
        };
        readerMultiple.readAsDataURL(file);
    });
}


function attachThumbnailListeners(){
    const multipleImgBtn = document.querySelectorAll('.multipleImgBtn');
  
    if(multipleImgBtn.length > 0){
        
        multipleImgBtn.forEach(element => {
            element.addEventListener('click', function() {
                multipleImgBtn.forEach(item => {
                    item.classList.remove('selected');
                });
                this.classList.add('selected');
    
                const videoSrc = this.getAttribute('data-src');
                const previewImage = document.getElementById('previewVideo');
                previewImage.src = videoSrc;
                previewImage.load();

                const caption = this.getAttribute('data-caption');
                captionInput.value = caption || '';
                captionInput.setAttribute('data-index', this.getAttribute('data-index'));

            });

            const removeImg = element.querySelector('#removeImg');
            removeImg.addEventListener('click',function(e){
                e.stopPropagation();
                
                const isSelected = element.classList.contains('selected');
                const fileIndex = parseInt(element.getAttribute('data-index'), 10);
                 
                // Removed file from videoBlobs
                if (fileIndex >= 0 && videoBlobs.length > fileIndex) {
                    videoBlobs.splice(fileIndex, 1);
                }


                element.remove();

                const remainingItems = document.querySelectorAll('.multipleImgBtn');
                if(remainingItems.length > 0){
                    if(isSelected){  
                        remainingItems[0].classList.add('selected');
                        const videoSrc = remainingItems[0].getAttribute('data-src');
                        const previewImage = document.getElementById('previewVideo');
                        previewImage.src = '';
                        previewImage.src = videoSrc;
                        previewImage.load();

                        const caption = remainingItems[0].getAttribute('data-caption');
                        captionInput.value = caption || '';
                        captionInput.setAttribute('data-index', remainingItems[0].getAttribute('data-index'));
                    }
                }else{
                    imagePreviewContainer.style.display = 'none';
                    chat_box.style.display = 'block';
                    chat_box_input.style.display = 'flex';
                    plusUpload.style.display = 'block';
                    plusUploadClose.style.display = 'none';

                }
            });
        });

        commonCaption();

    }
}


const sendFiles = document.getElementById('sendFiles');

sendFiles.addEventListener('click', async ()=>{
    if(videoBlobs.length > 0){
        send_videos();
    }else{
        send_images();   
    }
    clearImages();

    
});

async function send_videos(){
   
    videoBlobs.forEach(async (video, index)  => {
        const formData = new FormData();
        formData.append('video', video.file);

        const videoBtn = document.querySelector(`.multipleImgBtn[data-index="${video.index}"]`);
        const caption = videoBtn ? videoBtn.getAttribute('data-caption') : '';
        formData.append(`captions`, caption); 

        formData.append('receiver_usr',selectedUserId);
        await fileSendApi(formData);
        
    });
   

   
}

function send_images(){
   
    imageSave.forEach( async (image, index) => {

        const formData = new FormData();
        formData.append('image', image.file);
       
        const imageBtn = document.querySelector(`.multipleImgBtn[data-index="${image.index}"]`);
  
        const caption = imageBtn ? imageBtn.getAttribute('data-caption') : '';
       
        formData.append(`captions`, caption); 
        formData.append('receiver_usr',selectedUserId);

        await fileSendApi(formData);
 

    });
}

// send file to api
async function fileSendApi(formData){
    try{
        const response = await fetch('/upload-video/', {
            method: 'POST',
            header:{
                'Content-Type':'application/json',
                'X-CSRFToken':getCookie('csrftoken')
            },
            body: formData,
        });
        
        const data = await  response.json();

        chatSocket.send(JSON.stringify({
            'action': 'send_message',
            'message': '',
            'receiver_id': selectedUserId,
            'Send_Data': data.message,
        })); 

        videoBlobs = [];
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

// file view in message
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

chatSocket.onmessage = function(e){
        const data = JSON.parse(e.data);
        console.log(data);
        
        if(data.type == 'chat_history'){
            handleChathistory(data);
        }else if(data.type == 'chat_message'){
            handleChatMessage(data);
        }else if(data.type  == 'user_status' && selectedUserId == data.user_id){
            
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
            
        }

        
        if(data.type != 'user_status'){
            let emaplath = ``; 
            if(djangoUserId == data.sender_id){
                moveToTop(data.receiver_id);
                emaplath = `.chatlist .block[data-user-id="${data.receiver_id}"]`
            }else if(djangoUserId == data.receiver_id){
                moveToTop(data.sender_id);
                emaplath = `.chatlist .block[data-user-id="${data.sender_id}"]`
            }
            if(emaplath !== ``){
                const userElements = document.querySelector(emaplath);
                if(userElements){
                    const messagePElement = userElements.querySelector('.message_p p');
                    if (data.type_content == 'Photo' && data.video_duration===''){
                        messagePElement.textContent = 'Photo';
                    }else if(data.type_content == 'Video' && data.video_duration===''){
                        messagePElement.textContent = 'Video';
                    }else{
                        
                        if(data.video_duration  === ''){
                            messagePElement.textContent = data.message; 
                        }else{
                            messagePElement.textContent = data.caption;
                        }
                        
                    }
                    const times = userElements.querySelector('.listHead p');
                    times.textContent = data.timestamp;
                }
            }
        }
       
}

function moveToTop(userId){
    const chatList = document.getElementById('chatlist');
    const targetBlock = document.querySelector(`.block[data-user-id="${userId}"]`);

    if(chatList && targetBlock){
        chatList.prepend(targetBlock);
        targetBlock.style.transition = "background-color 0.5s ease"; 
        
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
                <div class="date-label">
                    <p>${day.date}</p>
                </div>
            `;

            const  rightChatbox =  document.querySelector('.rightside .chatBox');
            rightChatbox.insertAdjacentHTML('beforeend', dateLabel);

            day.messages.forEach((message) => {
                appendMessage(message);
            });
           
            const userElements = document.querySelector(`.chatlist .block[data-user-id="${selectedUserId}"]`);
            const messagePElement = userElements.querySelector('.message_p');
            let toggleCountElement = messagePElement.querySelector('.toggle-count');
            if(toggleCountElement){
                toggleCountElement.remove();
            }
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

function appendMessage(message){
    const chatboxs  = document.querySelector('.rightside .chatBox');
    if(message.sender == djangoUserId){
       
        let messageElement; 
        if(message.img){
      
            messageElement = `
                <div class="message my_message">
                    <div class="mainImage end_background">
                        ${message.is_reply_status ?
                            `<div class="status_part" style="background-color: #025144;">
                                <span class="status_part_left-line"></span>
                                <div class="status_part_conntent">
                                    <div class="status_part_conntent_wrap">
                                        <div class="status_part_conntent_title">
                                            <span>${message.reciver_name} · Status</span>
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
                                        <div class="status_part_img_second" >
                                            <div class="status_part_imgview" style="background-image: url(${ensureMediaPrefix(message.img)});"> </div>
                                        </div>
                                    </div>
                                </div>
                            </div> 
                            <div class="caption">${message.caption}</div>
                            <span class="caption_timestamp">${message.timestamp}</span>`
                        :        
                        `<div class="first_view" onclick="playVideo('media/${message.img}', '${true}');">
                                <div class="innerImage">
                                    <img src="media/${message.img}" class="image" alt="Image">
                                </div> 
                                ${message.caption ?'':
                                    `<div class="videoBottom flex-end">
                                        <span class="vide_timestamp">${message.timestamp}</span>
                                    </div>`}
                            </div> 
                            ${message.caption ? `<div class="caption">${message.caption}</div>` : ''}
                            ${message.caption ? `<span class="caption_timestamp">${message.timestamp}</span>` : ''}`}
                    </div> 
                </div>`
            ;
        }else if(message.video){
            const uniqueId = `video_${message.video.substring(message.video.lastIndexOf('/') + 1)}`;

            messageElement =`
            <div class="message my_message">
                <div class="mainImage end_background">
                    ${message.is_reply_status ?
                        `<div class="status_part" style="background-color: #025144;">
                            <span class="status_part_left-line"></span>
                            <div class="status_part_conntent">
                                <div class="status_part_conntent_wrap">
                                    <div class="status_part_conntent_title">
                                        <span>${message.reciver_name} · Status</span>
                                    </div>
                                    <div class="status_part_conntent_title_bottom">
                                        <div class="status_part_conntent_title_bottom_icon">
                                            <svg viewBox="0 0 16 20" height="20" width="16" preserveAspectRatio="xMidYMid meet" class="" version="1.1" x="0px" y="0px" enable-background="new 0 0 16 20"><title>status-video</title><path fill="currentColor" d="M15.243,5.868l-3.48,3.091v-2.27c0-0.657-0.532-1.189-1.189-1.189H1.945 c-0.657,0-1.189,0.532-1.189,1.189v7.138c0,0.657,0.532,1.189,1.189,1.189h8.629c0.657,0,1.189-0.532,1.189-1.189v-2.299l3.48,3.09 V5.868z"></path></svg>
                                        </div>
                                        <span dir="auto" style="min-height: 0px;line-height: 23px;margin-right: 3px;">00:${message.replied_video_duration}</span>
                                        <span dir="auto" style="min-height: 0px; line-height: 23px;">Video</span>
                                    </div>
                                </div>
                            </div> 
                            <div class="status_part_img">
                                <div class="status_part_img_first">
                                    <div class="status_part_img_second" >
                                        <div class="status_part_imgview" style="background-image: url(${ensureMediaPrefix(message.video)});"> </div>
                                    </div>
                                </div>
                            </div>
                        </div> 
                        <div class="caption">${message.caption}</div>
                        <span class="caption_timestamp">${message.timestamp}</span>`
                    :         
                    `<div class="first_view" onclick="playVideo('${message.video}', '${false}')">
                        <div class="playButton" id="playButton" >
                            <!-- Play Icon -->
                            <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" class="" version="1.1"><title>media-play</title><path d="M19.5,10.9 L6.5,3.4 C5.2,2.7 4.1,3.3 4.1,4.8 L4.1,19.8 C4.1,21.3 5.2,21.9 6.5,21.2 L19.5,13.7 C20.8,12.8 20.8,11.6 19.5,10.9 Z" fill="currentColor"></path></svg>
                        </div>
                        <video id="previewVideo_message" data-unique-id="${uniqueId}" muted onloadedmetadata="setDuration(this)">
                            <source id="MyDuration_${uniqueId}" src="${message.video}" type="video/mp4">
                        </video>  
                        <div class="media-loader">
                            <div class="loader"></div>
                        </div>

                        <div class="videoBottom space-between">
                            <span id="videoDuration_${uniqueId}" class="video-duration"></span>
                            ${message.caption ?'':`<span class="vide_timestamp">${message.timestamp}</span>`}
                        </div> 

                    </div>
                    ${message.caption ? `<div class="caption">${message.caption}</div>` : ''}
                    ${message.caption ? `<span class="caption_timestamp">${message.timestamp}</span>` : ''}
                    `}
                </div> 
                
            </div>`;
        }else{
            messageElement = `
                <div class="message my_message">
                    <p>${message.content} <span>${message.timestamp}</span></p>
                </div>
            `;
        }
       
        chatboxs.insertAdjacentHTML('beforeend', messageElement);
          
    }
    if(selectedUserId == message.sender && djangoUserId == message.receiver){  
        if(message.sender != message.receiver){
           
            let messageElement;
            if(message.img){
                messageElement = `
                    <div class="message frnd_message">
                        <div class="mainImage start_background">
                            ${message.is_reply_status ?
                                `<div class="status_part" style="background-color: #1d282f;">
                                    <span class="status_part_left-line"></span>
                                    <div class="status_part_conntent">
                                        <div class="status_part_conntent_wrap">
                                            <div class="status_part_conntent_title">
                                                <span>You · Status</span>
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
                                            <div class="status_part_img_second" >
                                                <div class="status_part_imgview" style="background-image: url(${ensureMediaPrefix(message.img)});"> </div>
                                            </div>
                                        </div>
                                    </div>
                                </div> 
                                <div class="caption">${message.caption}</div>
                                <span class="caption_timestamp">${message.timestamp}</span>`
                              :        
                               `<div class="first_view" onclick="playVideo('${message.img}', '${true}')">
                                    <div class="innerImage">
                                        <img src="media/${message.img}" class="image" alt="Image">
                                    </div> 
                                    ${message.caption ?'':
                                        `<div class="videoBottom flex-end">
                                            <span class="vide_timestamp">${message.timestamp}</span>
                                        </div>`}
                                </div> 
                                ${message.caption ? `<div class="caption">${message.caption}</div>` : ''}
                                ${message.caption ? `<span class="caption_timestamp">${message.timestamp}</span>` : ''}`}
                        </div> 
                    </div>`
                ;
                
            }else if(message.video){
                const uniqueId = `video_${message.video.substring(message.video.lastIndexOf('/') + 1)}`;

                messageElement =`
                <div class="message frnd_message">
                    <div class="mainImage start_background">
                        ${message.is_reply_status ?
                            `<div class="status_part" style="background-color: #1d282f;">
                                <span class="status_part_left-line"></span>
                                <div class="status_part_conntent">
                                    <div class="status_part_conntent_wrap">
                                        <div class="status_part_conntent_title">
                                            <span>You · Status</span>
                                        </div>
                                        <div class="status_part_conntent_title_bottom">
                                            <div class="status_part_conntent_title_bottom_icon">
                                                <svg viewBox="0 0 16 20" height="20" width="16" preserveAspectRatio="xMidYMid meet" class="" version="1.1" x="0px" y="0px" enable-background="new 0 0 16 20"><title>status-video</title><path fill="currentColor" d="M15.243,5.868l-3.48,3.091v-2.27c0-0.657-0.532-1.189-1.189-1.189H1.945 c-0.657,0-1.189,0.532-1.189,1.189v7.138c0,0.657,0.532,1.189,1.189,1.189h8.629c0.657,0,1.189-0.532,1.189-1.189v-2.299l3.48,3.09 V5.868z"></path></svg>
                                            </div>
                                            <span dir="auto" style="min-height: 0px;line-height: 23px;margin-right: 3px;">00:${message.replied_video_duration}</span>
                                            <span dir="auto" style="min-height: 0px; line-height: 23px;">Video</span>
                                        </div>
                                    </div>
                                </div> 
                                <div class="status_part_img">
                                    <div class="status_part_img_first">
                                        <div class="status_part_img_second" >
                                            <div class="status_part_imgview" style="background-image: url(${ensureMediaPrefix(message.video)});"> </div>
                                        </div>
                                    </div>
                                </div>
                            </div> 
                            <div class="caption">${message.caption}</div>
                            <span class="caption_timestamp">${message.timestamp}</span>`
                        :   
                        `<div class="first_view" onclick="playVideo('${message.video}', '${false}')">
                            <div class="playButton" id="playButton">
                                <!-- Play Icon -->
                                <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" class="" version="1.1"><title>media-play</title><path d="M19.5,10.9 L6.5,3.4 C5.2,2.7 4.1,3.3 4.1,4.8 L4.1,19.8 C4.1,21.3 5.2,21.9 6.5,21.2 L19.5,13.7 C20.8,12.8 20.8,11.6 19.5,10.9 Z" fill="currentColor"></path></svg>
                            </div>
                            <video id="previewVideo_message" data-unique-id="${uniqueId}" muted onloadedmetadata="setDuration(this)">
                                <source id="MyDuration_${uniqueId}" src="${message.video}" type="video/mp4">
                            </video>  
                            <div class="media-loader">
                                <div class="loader"></div>
                            </div>
    
                           <div class="videoBottom space-between">
                                <span id="videoDuration_${uniqueId}" class="video-duration"></span>
                                ${message.caption ?'':`<span class="vide_timestamp">${message.timestamp}</span>`}
                            </div> 
    
                        </div>
                        ${message.caption ? `<div class="caption">${message.caption}</div>` : ''}
                        ${message.caption ? `<span class="caption_timestamp">${message.timestamp}</span>` : ''}
                        `}
                    </div> 
                    
                </div>`;
            }else{
                messageElement = `
                    <div class="message frnd_message">
                        <p>${message.content} <span>${message.timestamp}</span></p>
                    </div>
                `;
            }
            if(message.content){
                
            }else{
                
            }
            
            chatboxs.insertAdjacentHTML('beforeend', messageElement);
           
        }
    }
} 

function handleChatMessage(data){
    const currentDate = data.label_time;
    const chatBoxs = document.querySelector('.rightside .chatBox');
    
    if(lastDate == ''){
        const dateLabel = `
        <div class="date-label">
            <p>${currentDate}</p>
        </div>
       `;
       chatBoxs.insertAdjacentHTML('beforeend', dateLabel);
        lastDate = currentDate; 
    }
    if(lastDate !== currentDate){
        const dateLabel = `
            <div class="date-label">
                <p>${currentDate}</p>
            </div>
        `;
        chatBoxs.insertAdjacentHTML('beforeend', dateLabel);
        lastDate = currentDate;  // Update thelastDate to the current date
    } 
    
    if(data.sender_id == djangoUserId){
        if (data.type_content == 'Photo'){
           
            const messageElement = `
                <div class="message my_message">
                    <div class="mainImage end_background">
                        ${ data.is_reply_status ?
                        `<div class="status_part" style="background-color: #025144;">
                            <span class="status_part_left-line"></span>
                            <div class="status_part_conntent">
                                <div class="status_part_conntent_wrap">
                                    <div class="status_part_conntent_title">
                                        <span>${data.reciver_name} · Status</span>
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
                                    <div class="status_part_img_second" >
                                        <div class="status_part_imgview" style="background-image: url(${data.url});"> </div>
                                    </div>
                                </div>
                            </div>
                        </div> 
                       <div class="caption">${data.caption}</div>
                       <span class="caption_timestamp">${data.timestamp}</span> `:
                       `<div class="first_view" onclick="playVideo('${data.url}', '${true}')">
                            <div class="innerImage">
                                <img src="${data.url}" class="image" alt="Image">
                            </div> 
                            ${data.caption ?'':
                                `<div class="videoBottom flex-end">
                                    <span class="vide_timestamp">${data.timestamp}</span>
                                </div>`}
                        </div> 
                        ${data.caption ? `<div class="caption">${data.caption}</div>` : ''}
                        ${data.caption ? `<span class="caption_timestamp">${data.timestamp}</span>` : ''}` 
                    }
                    
                    </div> 
                </div>`;

            chatBoxs.insertAdjacentHTML('beforeend', messageElement);
        
        }else if(data.type_content == 'Video'){
            
            const uniqueId = `video_${data.url.substring(data.url.lastIndexOf('/') + 1)}`;

            const messageElement =`
            <div class="message my_message">
                <div class="mainImage end_background">
                    ${data.is_reply_status ?
                        `<div class="status_part" style="background-color: #025144;">
                            <span class="status_part_left-line"></span>
                            <div class="status_part_conntent">
                                <div class="status_part_conntent_wrap">
                                    <div class="status_part_conntent_title">
                                        <span>${data.reciver_name} · Status</span>
                                    </div>
                                    <div class="status_part_conntent_title_bottom">
                                        <div class="status_part_conntent_title_bottom_icon">
                                            <svg viewBox="0 0 16 20" height="20" width="16" preserveAspectRatio="xMidYMid meet" class="" version="1.1" x="0px" y="0px" enable-background="new 0 0 16 20"><title>status-video</title><path fill="currentColor" d="M15.243,5.868l-3.48,3.091v-2.27c0-0.657-0.532-1.189-1.189-1.189H1.945 c-0.657,0-1.189,0.532-1.189,1.189v7.138c0,0.657,0.532,1.189,1.189,1.189h8.629c0.657,0,1.189-0.532,1.189-1.189v-2.299l3.48,3.09 V5.868z"></path></svg>     
                                        </div>
                                        <span dir="auto" style="min-height: 0px;line-height: 23px;margin-right: 3px;">00:${data.video_duration}</span>
                                        <span dir="auto" style="min-height: 0px; line-height: 23px;">Video</span>
                                    </div>
                                </div>
                            </div> 
                            <div class="status_part_img">
                                <div class="status_part_img_first">
                                    <div class="status_part_img_second" >
                                        <div class="status_part_imgview" style="background-image: url(${ensureMediaPrefix(data.url)});"> </div>
                                    </div>
                                </div>
                            </div>
                        </div> 
                        <div class="caption">${data.caption}</div>
                        <span class="caption_timestamp">${data.timestamp}</span>`
                    :        
                    `<div class="first_view" onclick="playVideo('${data.url}', '${false}')">
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
                            ${data.caption ?'':`<span class="vide_timestamp">${data.timestamp}</span>`}
                        </div> 

                    </div>
                    ${data.caption ? `<div class="caption">${data.caption}</div>` : ''}
                    ${data.caption ? `<span class="caption_timestamp">${data.timestamp}</span>` : ''}
                    `}
                </div> 
                
            </div>`;
            chatBoxs.insertAdjacentHTML('beforeend', messageElement);
            chatBoxs.scrollTop = chatBoxs.scrollHeight;

        }else{
            const messageElement = `
                <div class="message my_message">
                    <p>${data.message} <span>${data.timestamp}</span></p>
                </div>
            `;
            chatBoxs.insertAdjacentHTML('beforeend', messageElement);
        }
        
    
      
    }else{
        if(data.check_contacts == false && djangoUserId == data.receiver_id){
            
            const userlist =  document.querySelector('.chatlist')
            const userBlock = document.createElement('div');
            userBlock.className = 'block';
            userBlock.setAttribute('data-user-id', data.sender_id);
            userBlock.innerHTML = `
                <div class="imgbox">
                   <img src="${data.img != null ? data.img : '/static/images/profile.png'}" class="cover"> 
                </div>
                <div class="details">
                    <div class="listHead">
                        <h4>${data.sender}</h4>
                       <p class="time">${data.last_msg_time}</p>
                    </div>
                    <div class="message_p">
                        <p>"Messages are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them. Click to learn more"</p>
                        <b class="toggle-count">0</b>
                    </div>
                </div>
            `;
            
            userlist.appendChild(userBlock);
            clickopenbox();
        }
        if(selectedUserId == data.sender_id && djangoUserId == data.receiver_id){  
            
            if(data.sender_id != data.receiver_id){
                if (data.type_content == 'Photo'){

                    const messageElement = `
                        <div class="message frnd_message">
                            <div class="mainImage start_background">
                                ${data.is_reply_status ?
                                  `<div class="status_part" style="background-color: #1d282f;">
                                        <span class="status_part_left-line"></span>
                                        <div class="status_part_conntent">
                                            <div class="status_part_conntent_wrap">
                                                <div class="status_part_conntent_title">
                                                    <span>You · Status</span>
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
                                                <div class="status_part_img_second" >
                                                    <div class="status_part_imgview" style="background-image: url(${data.url});"> </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div> 
                                <div class="caption">${data.caption}</div>
                                <span class="caption_timestamp">${data.timestamp}</span>`

                                :`<div class="first_view" onclick="playVideo('${data.url}', '${true}')">
                                    <div class="innerImage">
                                        <img src="${data.url}" class="image" alt="Image">
                                    </div> 
                                    ${data.caption ?'':
                                        `<div class="videoBottom flex-end">
                                            <span class="vide_timestamp">${data.timestamp}</span>
                                        </div>`}
                                </div> 
                                ${data.caption ? `<div class="caption">${data.caption}</div>` : ''}
                                ${data.caption ? `<span class="caption_timestamp">${data.timestamp}</span>` : ''}`}
                            </div> 
                        </div>`;

                    chatBoxs.insertAdjacentHTML('beforeend', messageElement);
                        
                }else if(data.type_content == 'Video'){
                    
                    const uniqueId = `video_${data.url.substring(data.url.lastIndexOf('/') + 1)}`;

                    const messageElement =`
                        <div class="message frnd_message">
                            <div class="mainImage start_background">
                                ${data.is_reply_status ?
                                    `<div class="status_part" style="background-color: #1d282f;">
                                        <span class="status_part_left-line"></span>
                                        <div class="status_part_conntent">
                                            <div class="status_part_conntent_wrap">
                                                <div class="status_part_conntent_title">
                                                    <span>You · Status</span>
                                                </div>
                                                
                                                <div class="status_part_conntent_title_bottom">
                                                    <div class="status_part_conntent_title_bottom_icon">
                                                        <svg viewBox="0 0 16 20" height="20" width="16" preserveAspectRatio="xMidYMid meet" class="" version="1.1" x="0px" y="0px" enable-background="new 0 0 16 20"><title>status-video</title><path fill="currentColor" d="M15.243,5.868l-3.48,3.091v-2.27c0-0.657-0.532-1.189-1.189-1.189H1.945 c-0.657,0-1.189,0.532-1.189,1.189v7.138c0,0.657,0.532,1.189,1.189,1.189h8.629c0.657,0,1.189-0.532,1.189-1.189v-2.299l3.48,3.09 V5.868z"></path></svg>
                                                    </div>
                                                    <span dir="auto" style="min-height: 0px;line-height: 23px;margin-right: 3px;">00:${data.video_duration}</span>
                                                    <span dir="auto" style="min-height: 0px; line-height: 23px;">video</span>
                                                </div>
                                            </div>
                                        </div> 
                                        <div class="status_part_img">
                                            <div class="status_part_img_first">
                                                <div class="status_part_img_second" >
                                                    <div class="status_part_imgview" style="background-image: url(${data.url});"> </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div> 
                                <div class="caption">${data.caption}</div>
                                <span class="caption_timestamp">${data.timestamp}</span>`

                              : 
                                `<div class="first_view">
                                    <div class="playButton" id="playButton" onclick="playVideo('${data.url}', '${false}')">
                                        <!-- Play Icon -->
                                        <svg viewBox="0 0 24 24" height="24" width="24" preserveAspectRatio="xMidYMid meet" class="" version="1.1"><title>media-play</title><path d="M19.5,10.9 L6.5,3.4 C5.2,2.7 4.1,3.3 4.1,4.8 L4.1,19.8 C4.1,21.3 5.2,21.9 6.5,21.2 L19.5,13.7 C20.8,12.8 20.8,11.6 19.5,10.9 Z" fill="currentColor"></path></svg>
                                    </div>
                                    <video id="previewVideo_message" data-unique-id="${uniqueId}" muted onloadedmetadata="setDuration(this)">
                                        <source id="MyDuration_${uniqueId}" src="${data.url}" type="video/mp4">
                                    </video>  
                                    <div class="media-loader">
                                        <div class="loader"></div>
                                    </div>
            
                                    <div class="videoBottom flex-end">
                                        <span id="videoDuration_${uniqueId}" class="video-duration"></span>
                                        ${data.caption ?'':`<span class="vide_timestamp">${data.timestamp}</span>`}
                                    </div> 
            
                                </div>
                                ${data.caption ? `<div class="caption">${data.caption}</div>` : ''}
                                ${data.caption ? `<span class="caption_timestamp">${data.timestamp}</span>` : ''}
                                `}
                            </div> 
                            
                        </div>`;
                    chatBoxs.insertAdjacentHTML('beforeend', messageElement);
                    chatBoxs.scrollTop = chatBoxs.scrollHeight;
                }else{
                    const messageElement = `
                        <div class="message frnd_message">
                            <p>${data.message} <span>${data.timestamp}</span></p>
                        </div>
                    `;
                    chatBoxs.insertAdjacentHTML('beforeend', messageElement);
                }
                
                
                
                chatBoxs.scrollTop = chatBoxs.scrollHeight;
                
                chatSocket.send(JSON.stringify({
                    'action':'send_message_toggle_true',
                    'receiver_id': data.receiver_id,
                    'sender_id':data.sender_id,
                }));
               
            }
                
        }else{
            if(djangoUserId == data.receiver_id){
                const userElements = document.querySelector(`.chatlist .block[data-user-id="${data.sender_id}"]`);
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

function saveContactsApi(email){
    fetch('/create_contacts/',{
        method:'POST',
        header:{
            'Content-Type':'application/json',
            'X-CSRFToken':getCookie('csrftoken')
        },
        body:JSON.stringify({contact_email:email})
    }).then(response => response.json()).then(data=>{
        if(data.status == 200){
            draweEmailInput.value = '';
            adduserDrawer.classList.remove('open');
            getContacts('');
        }else{
            console.error('Error:',data);    
        }
    }).catch(error => {
        console.error('Error:',error);
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
                <div class="imgbox">
                   <img src="${user.profile_image != null ? user.profile_image : '/static/images/profile.png'}" class="cover"> 
                </div>
                <div class="details">
                    <div class="listHead">
                        <h4>${user.username}</h4>
                        <ion-icon name="trash-outline" class="deleteButton" id="deleteButton"></ion-icon>
                    </div>
                </div>
            `;
            
            drwerChatlist.appendChild(userBlock);

            const deleteButton = userBlock.querySelector('.deleteButton');
            if(deleteButton){
                deleteButton.addEventListener('click',()=>{
                    deleteDialog.style.display = 'flex';
                    deleteDialog.setAttribute('data-user-id', user.id);
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
            const userBlockToRemove = document.querySelector(`.drwer-chatlist .drawer-block[data-user-id="${id}"]`);
            if(userBlockToRemove){
                userBlockToRemove.remove();
            }
        }
    }).catch(error => {
        console.error('Error:',error);
    });
} 


function clickopenbox(){
    const chatBlocksClick = document.querySelectorAll('.block');
    chatBlocksClick.forEach(block=>{
        block.addEventListener('click', function(){
        
            clearImages();   
            document.querySelectorAll('.chatlist .block').forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            if(selectedUserId == null){
                rightSide.style.display = 'inline';
                introRight.style.display = 'none';
            }
            selectedUserId = this.getAttribute('data-user-id');

            document.querySelector('.rightside .chatBox').innerHTML = '';
            chatSocket.send(JSON.stringify({
                'action': 'send_history',
                'receiver_id': selectedUserId,
            })); 

            const userId = this.getAttribute('data-user-id');
            const userName = this.querySelector('.listHead h4').textContent;
            const profileImage = this.querySelector('.imgbox img').src;
            const lastMessageTime = this.querySelector('.time').textContent;

            document.querySelector('.rightside .userimg img').src = profileImage;
            document.querySelector('.rightside h4').innerHTML = `${userName}<br><span id="statusText">online</span>`;
        });
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