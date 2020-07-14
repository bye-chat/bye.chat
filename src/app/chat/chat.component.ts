import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  private rtcConfiguration: RTCConfiguration;
  private rtcPeerConnection: RTCPeerConnection;
  private rtcDataChannel: RTCDataChannel;
  private rtcIceCandidate: RTCIceCandidate;

  localDescription = 'create an offer to start.. or paste an offer into the remoteDescription to get an answer';
  iceCandidates = '';

  constructor() { }

  ngOnInit(): void {

    // Configure Session Traversal Utilities for NAT (STUN)
    this.rtcConfiguration = {
      iceServers: [
        {urls: 'stun:stun.l.google.com:19302'},
        {urls: 'stun:stun1.l.google.com:19302'},
        {urls: 'stun:stun2.l.google.com:19302'},
        {urls: 'stun:stun3.l.google.com:19302'},
        {urls: 'stun:stun4.l.google.com:19302'},
        {urls: 'stun:stun.services.mozilla.com'}
      ]
    };

    // Create a new Peer Connection and pass in the rtcConfiguration
    this.rtcPeerConnection = new RTCPeerConnection(null);

    // Create a Data Channel
    this.rtcDataChannel = this.rtcPeerConnection.createDataChannel('chat');

    this.rtcPeerConnection.onicecandidate = this.onicecandidate();

    this.rtcDataChannel.onopen = function() {
      console.log('rtcDataChannel open');
    }
    this.rtcDataChannel.onclose = function() {
      console.log('rtcDataChannel close');
    }

    this.rtcPeerConnection.ondatachannel = this.ondatachannel();

  }

  // Create an Offer
  createOffer(): void {    
    this.rtcPeerConnection.createOffer()
      .then(this.setLocalDescription())
      .catch(this.errorHandler);
  
    console.log(this.rtcPeerConnection.getConfiguration());
  }

  // Set the Local Description with the Session Description Protocol (SDP)
  private setLocalDescription(): (string) => void {
    return (rtcSessionDescription) => {
      this.rtcPeerConnection.setLocalDescription(rtcSessionDescription)
        .then(() => {
          console.log(this.rtcPeerConnection.localDescription);
          this.localDescription = JSON.stringify(this.rtcPeerConnection.localDescription.toJSON());
          
        })
        .catch(this.errorHandler);
    };
  }

  // Using copy and paste for signaling the Offer and Answer, get pasted JSON
  setRemoteDescription(event: ClipboardEvent) {
    let clipboardData = event.clipboardData;
    let rtcSessionDescription = new RTCSessionDescription(JSON.parse(clipboardData.getData('text')));

    // If the Remote Description is an Offer then Create an Answer
    if (rtcSessionDescription.type == 'offer')
    {
      this.rtcPeerConnection.setRemoteDescription(rtcSessionDescription)
        .then(() => {
          this.rtcPeerConnection.createAnswer()
            .then(this.setLocalDescription())
            .catch(this.errorHandler);
        })
        .catch(this.errorHandler);
    }

    // If the Remote Description is an Answer then Create ICE Candidate
    if (rtcSessionDescription.type == 'answer')
    {
      this.rtcPeerConnection.setRemoteDescription(rtcSessionDescription)
        .then(() => {
          console.log('Copy the ice candidate to remote peer to establish channel..');          
        })
        .catch(this.errorHandler);
    }
  }

  // Log ICE Candidates
  private onicecandidate(): (string) => void {
    return (event) => {
      if (event.candidate) {
        console.log(event.candidate);
        this.rtcIceCandidate = event.candidate;
        this.iceCandidates = JSON.stringify(this.rtcIceCandidate.toJSON());
      } else {
        console.log('All ICE candidates have been created');
      }
    };
  }

  // Using copy and paste for signaling the ICE Candidate, get pasted JSON
  addIceCandidate(event: ClipboardEvent) {
    let clipboardData = event.clipboardData;
    let rtcIceCandidate = new RTCIceCandidate(JSON.parse(clipboardData.getData('text')));

    //console.log(rtcIceCandidate);
    this.rtcPeerConnection.addIceCandidate(rtcIceCandidate)
      .then(() => {
        console.log('ICE Candidate Added');        
      })
      .catch(this.errorHandler);
  }

  // Log Data Channel
  private ondatachannel(): (string) => void {
    return (event) => {
      console.log(event.channel);
      event.channel.onmessage = this.onmessage();
    }
  }

  // Log Message
  private onmessage(): (string) => void {
    return (event) => {
      console.log('Received Message ' + event.data);
    }
  }

  sendChat(): void {
    let message = (<HTMLInputElement>document.getElementById('chat')).value;
    this.rtcDataChannel.send(message);
    console.log('Sent Data: ' + message);
  }

  // Log errors to the console
  private errorHandler(error) {
    console.log(error);
  }

}
