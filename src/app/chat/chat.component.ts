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

  localDescription = 'create an offer to start..';

  constructor() { }

  ngOnInit(): void {

    // Configure Session Traversal Utilities for NAT (STUN)
    this.rtcConfiguration = {
      iceServers: [
        {urls: 'stun:stun.l.google.com:19302'},
        {urls: 'stun:stun1.l.google.com:19302'},
        {urls: 'stun:stun2.l.google.com:19302'},
        {urls: 'stun:stun3.l.google.com:19302'},
        {urls: 'stun:stun4.l.google.com:19302'}
      ]
    };

    // Create a new Peer Connection and pass in the rtcConfiguration
    this.rtcPeerConnection = new RTCPeerConnection(null);

    // Create a Data Channel
    this.rtcDataChannel = this.rtcPeerConnection.createDataChannel('chat');

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

  // Using copy and paste for signaling, get pasted JSON
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

    // If the Remote Description is an Answer then Create 
    if (rtcSessionDescription.type == 'answer')
    {
      this.rtcPeerConnection.setRemoteDescription(rtcSessionDescription)
        .then(() => {
          console.log('handshake complete')
        })
        .catch(this.errorHandler);
    }
  }

  // Log errors to the console
  private errorHandler(error) {
    console.log(error);
  }

}
