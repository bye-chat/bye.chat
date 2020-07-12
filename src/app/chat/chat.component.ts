import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  private rtcConfiguration: RTCConfiguration;
  private rtcPeerConnection: RTCPeerConnection;

  localDescription = 'loading..';

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
    this.rtcPeerConnection = new RTCPeerConnection(this.rtcConfiguration);

    // Create an Offer
    this.rtcPeerConnection
      .createOffer()
      .then(this.setLocalDescription())
      .catch(this.errorHandler);
  }

  // Set the Local Description with the Session Description Protocol (SDP)
  private setLocalDescription(): (string) => void {
    return (rtcSessionDescription) => {
      this.rtcPeerConnection.setLocalDescription(rtcSessionDescription)
        .then(() => {
          console.log(this.rtcPeerConnection.localDescription);
          this.localDescription = this.rtcPeerConnection.localDescription.sdp;
        })
        .catch(this.errorHandler);
    };
  }

  // Using copy and paste for signaling, get pasted SDP and Create an Answer
  setRemoteDescription(event: ClipboardEvent) {
    let clipboardData = event.clipboardData;

    this.rtcPeerConnection.setRemoteDescription({ type: 'offer', sdp: clipboardData.getData('text') })
      .then(() => {
        this.rtcPeerConnection
          .createAnswer()
          .then(this.setLocalDescription())
          .catch(this.errorHandler);
      })
      .catch(this.errorHandler);
  }

  // Log errors to the console
  private errorHandler(error) {
    console.log(error);
  }

}
