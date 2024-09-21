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
    console.log("this working");
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
        console.log(`confirm_click==${userId}`);
        deleteContact(userId);
    }   
});

saveButton.addEventListener('click',()=>{
    if(draweEmailInput.value.trim() != ''){
         console.log(draweEmailInput.value);
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
                            <img alt="Preview" src=${e.target.result}>
                        </div>
                    </button>
                `;
                mutipleImg.insertAdjacentHTML('beforeend', imgTeg); 
                if (index === files.length) {
                    stopLoading();
                    console.log('All images loaded');
                }
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
                    console.log(this.getAttribute('data-index'));
                    captionInput.setAttribute('data-index', this.getAttribute('data-index'));

                });
                const removeImg = element.querySelector('#removeImg');
                removeImg.addEventListener('click',function(e){
                   e.stopPropagation();
                   
                   const isSelected = element.classList.contains('selected');
                   
                   element.remove();

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
        
        console.log(files);
    
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
            console.log(`check==2=====${index}`);
            
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
                                <button class="multipleImgBtn" data-src="${videoBlob}" data-index="${videoIndexCounter}" data-caption="">
                                    <div class="first">
                                        <ion-icon name="close-outline" class="removeImg" id="removeImg"></ion-icon>
                                    </div>
                                    <div class="second">
                                        <img src="${thumbnailDataUrl}" width="100" height="75" alt="Video Thumbnail" />
                                    </div>
                                </button>
                            `;
                            mutipleImg.insertAdjacentHTML('beforeend', videoTag);
                            if (index === 0 && isFirstUpload) {
                                const multipleImgBtn = document.querySelector('.multipleImgBtn[data-index="0"]');    
                                multipleImgBtn.classList.add('selected');
                                const previewVideo = document.getElementById('previewVideo');
                                previewVideo.src = videoBlob;
                                previewVideo.load();
                            }
                            console.log(index);
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

sendFiles.addEventListener('click', ()=>{
    const  buttons  = document.querySelectorAll('.multipleImgBtn');
    const dataArray = [];
    buttons.forEach((element, index) => {
        
        const imgElement = element.querySelector('img');
        const imgSrc = imgElement ? imgElement.src : null;
        const caption = element.getAttribute('data-caption');
        const videoSrc = element.getAttribute('data-src');
        console.log(typeof videoSrc);
        if(videoSrc){
            dataArray.push({
                src: `${videoSrc}`,
                caption: caption,
                type:'Video',
            });
        }else if(imgSrc){
           dataArray.push({
            src: imgSrc,
            caption: caption,
            type: 'Photo',
           });
        }

    });
    console.log(dataArray);
    chatSocket.send(JSON.stringify({
        'action': 'send_message',
        'message': '',
        'receiver_id': selectedUserId,
        'Send_Files': dataArray,
    }));
    clearImages();

    
});

function customForVideo(videoSrc, caption){
    const chatBoxs = document.querySelector('.rightside .chatBox');
    const videoPreviewElement = `
         <div class="message my_message">
                    <div class="mainImage end_background video-container" >
                        <video id="previewVideo" muted>
                            <source src="" type="video/mp4">
                        </video>  
                            ${caption ? `<div class="caption">${caption}</div>` : ''}
                        <span class="timestamp" style=${caption ? '':'background-image: linear-gradient(to top, rgba(11, 20, 26, .5), rgba(11, 20, 26, 0));'}>8:30</span>
                    </div> 
                </div>`;
    chatBoxs.insertAdjacentHTML('beforeend', videoPreviewElement);
}


// Websocket event handlers

chatSocket.onmessage = function(e){
        const data = JSON.parse(e.data);
        console.log(data);
        
        if(data.type == 'chat_history'){
            handleChathistory(data);
        }else if(data.type == 'chat_message'){
            handleChatMessage(data);
        }

    let emaplath = `.chatlist .block[data-user-id="${selectedUserId}"]` 
    if(djangoUserId == data.sender_id){
        emaplath = `.chatlist .block[data-user-id="${data.receiver_id}"]`
    }else if(djangoUserId == data.receiver_id){
        emaplath = `.chatlist .block[data-user-id="${data.sender_id}"]`
    }
    const userElements = document.querySelector(emaplath);
    if(userElements){
        const messagePElement = userElements.querySelector('.message_p p');
        if (data.type_content == 'Photo'){
            messagePElement.textContent = 'Photo';
        }else if(data.type_content == 'Video'){
            messagePElement.textContent = 'Video';
        }else{
            messagePElement.textContent = data.message;
        }
        
            

        const times = userElements.querySelector('.listHead p');
        times.textContent = data.timestamp;
    }
       
}

// functions 
function handleChathistory(data){
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
                        <div class="first_view">
                            <div class="innerImage">
                                <img src="media/${message.img}" class="image" alt="Image">
                            </div> 
                            ${message.caption ?'':
                                `<div class="videoBottom flex-end">
                                    <span class="vide_timestamp">${message.timestamp}</span>
                                </div>`}
                        </div> 
                        ${message.caption ? `<div class="caption">${message.caption}</div>` : ''}
                        ${message.caption ? `<span class="caption_timestamp">${message.timestamp}</span>` : ''}
                    </div> 
                </div>`
            ;
        }else if(message.video){
            const uniqueId = `video_${message.video.substring(message.video.lastIndexOf('/') + 1)}`;

            messageElement =`
            <div class="message my_message">
                <div class="mainImage end_background">
                    <div class="first_view">
                        <div class="playButton" id="playButton" onclick="playVideo()">
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
                            <div class="first_view">
                                <div class="innerImage">
                                    <img src="media/${message.img}" class="image" alt="Image">
                                </div> 
                                ${message.caption ?'':
                                    `<div class="videoBottom flex-end">
                                        <span class="vide_timestamp">${message.timestamp}</span>
                                    </div>`}
                            </div> 
                            ${message.caption ? `<div class="caption">${message.caption}</div>` : ''}
                            ${message.caption ? `<span class="caption_timestamp">${message.timestamp}</span>` : ''}
                        </div> 
                    </div>`
                ;
                
            }else if(message.video){
                const uniqueId = `video_${message.video.substring(message.video.lastIndexOf('/') + 1)}`;

                messageElement =`
                <div class="message frnd_message">
                    <div class="mainImage start_background">
                        <div class="first_view">
                            <div class="playButton" id="playButton" onclick="playVideo()">
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
            console.log(data.send_File);
            let messageArray = JSON.parse(data.send_File);
            messageArray.forEach(images_data=>{
                const messageElement = `
                    <div class="message my_message">
                        <div class="mainImage end_background">
                            <div class="first_view">
                                <div class="innerImage">
                                    <img src="${images_data.url}" class="image" alt="Image">
                                </div> 
                                ${images_data.caption ?'':
                                    `<div class="videoBottom flex-end">
                                        <span class="vide_timestamp">${data.timestamp}</span>
                                    </div>`}
                            </div> 
                            ${images_data.caption ? `<div class="caption">${images_data.caption}</div>` : ''}
                            ${images_data.caption ? `<span class="caption_timestamp">${data.timestamp}</span>` : ''}
                        </div> 
                    </div>`;

                chatBoxs.insertAdjacentHTML('beforeend', messageElement);
                
            });
        }else if(data.type_content == 'Video'){
            let messageArray = JSON.parse(data.send_File);
            messageArray.forEach(video_data=>{
                const mediaSrc = video_data.video_src;
                const videoContainer = document.querySelector(`.video-container[data-src="${mediaSrc}"]`);
                if(videoContainer){
                    const videoElement = videoContainer.querySelector('video');
                    videoElement.setAttribute('controls', true);
                    videoElement.querySelector('source').src = video_data.url;
                    videoElement.load(); 
                }
            });

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
                    let messageArray = JSON.parse(data.send_File);
                    messageArray.forEach(images_data=>{
                        const messageElement = `
                            <div class="message frnd_message">
                                <div class="mainImage start_background">
                                    <div class="first_view">
                                        <div class="innerImage">
                                            <img src="${images_data.url}" class="image" alt="Image">
                                        </div> 
                                        ${images_data.caption ?'':
                                            `<div class="videoBottom flex-end">
                                                <span class="vide_timestamp">${data.timestamp}</span>
                                            </div>`}
                                    </div> 
                                    ${images_data.caption ? `<div class="caption">${images_data.caption}</div>` : ''}
                                    ${images_data.caption ? `<span class="caption_timestamp">${data.timestamp}</span>` : ''}
                                </div> 
                            </div>`;

                        chatBoxs.insertAdjacentHTML('beforeend', messageElement);
                        
                    });
                }else if(data.type_content == 'Video'){

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
            console.log(user);
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
                    console.log(`set==${user.id}`);
                    deleteDialog.setAttribute('data-user-id', user.id);
                });    
            }
            
        });
        
        
    }).catch(error => {
        console.error('Error:',error);
    });
}


function deleteContact(id){
    fetch(`/delete_contact?user_id=${id}`,{
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
            document.querySelector('.rightside h4').innerHTML = `${userName}<br><span>online</span>`;
        });
    });
   
}