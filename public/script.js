//js for front end lives here
const socket = io('/')
const videoGrid = document.getElementById('video-grid');
const myVideo = document.createElement('video');//creating element would create a screen for video to play on the browser
myVideo.muted= true; //specifies audio output of video should be muted


var peer = new Peer(undefined,{ //create a peer
    path:'/peerjs',
    host:'/',
    port:'443'
});

let myVideoStream //global variable
navigator.mediaDevices.getUserMedia({  //asks users permission for audio and video and returns a promise
    video:true,
    audio:true
}).then(stream =>{
    myVideoStream = stream;  //??
    addVideoStream(myVideo,stream); //stream is basically receiving the video in chunks and not the whole video 

    //this code is to answer when someone calls you i.e. enables you to show yourself to others
    peer.on('call',call =>{  
        call.answer(stream)//answer the stream
        const video = document.createElement('video')
        call.on('stream',userVideoStream=>{
            addVideoStream(video,userVideoStream)
        })
    })
    socket.on('user-connected',(userId)=>{ //client receives from server
        connectToNewUser(userId,stream);
    })
    let text = $('input') //where we write input

$('html').keydown((e) =>{  //using jquery go to html file which ejs
    if(e.which ==13 && text.val().length !== 0){   //e.which ==13 meanng that when users hits enter and the text length is greater than 0 than send this msg that user entered to the server
        //console.log(text.val()); //to get the value in front end console
        socket.emit('message',text.val());
        text.val(''); //clear the input
    }
});


socket.on('createMessage',message=>{  //receives the msg from server and sends it back to all users
    console.log('this is coming from server',message);
    $('ul').append(`<li class ="message"><b>user</b><br/>${message}</li>`)
    scrollToBottom();
}) 

})

peer.on('open',id =>{ //peerjs creates a uniue id for each user and send it to server
    socket.emit('join-room',ROOM_ID,id);//get room id from client and send to server
})



const connectToNewUser =(userId,stream)=>{ //this code is to call some other user
    const call = peer.call(userId,stream); //peer calls the other user who joined the vc using his userId and streams our video
    const video = document.createElement('video');//creates element for that new joined user
    call.on('stream',userVideoStream =>{ //other users stream
        addVideoStream(video,userVideoStream); //other users stream is added to the element space created for him
    })
}



const addVideoStream = (video,stream)=>{
    video.srcObject = stream; //element received the little chunk 
    video.addEventListener('loadedmetadata',()=>{  //when loadedmetadata is full then this listener will play the video by video.play method
        video.play();
    })
    videoGrid.append(video);
}

const scrollToBottom =() =>{ //this function allows us to show the most recent msgs when the msgs are full
    let d =$('.main__chat_window'); //selecting this div from the ejs
    d.scrollTop(d.prop("scrollHeight"));
}

//mute our video

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;//taking my stream and to get the audio we use getAudioTracks() array and it's first element is our track(audio)
    if (enabled) {  //if its enabled
      myVideoStream.getAudioTracks()[0].enabled = false; //then disable it
      setUnmuteButton();
    } else { //if its disable
      setMuteButton();
      myVideoStream.getAudioTracks()[0].enabled = true; //then enable it
    }
}

const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
      myVideoStream.getVideoTracks()[0].enabled = false;
      setPlayVideo()
    } else {
      setStopVideo()
      myVideoStream.getVideoTracks()[0].enabled = true;
    }
  }
  

const setMuteButton = () => {
    const html = `
      <i class="fas fa-microphone"></i>
      <span>Mute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
  }
  
  const setUnmuteButton = () => {
    const html = `
      <i class="unmute fas fa-microphone-slash"></i>
      <span>Unmute</span>
    `
    document.querySelector('.main__mute_button').innerHTML = html;
  }

  const setStopVideo = () => {
    const html = `
      <i class="fas fa-video"></i>
      <span>Stop Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }
  
  const setPlayVideo = () => {
    const html = `
    <i class="stop fas fa-video-slash"></i>
      <span>Play Video</span>
    `
    document.querySelector('.main__video_button').innerHTML = html;
  }



