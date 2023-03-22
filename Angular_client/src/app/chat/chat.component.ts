import { Component, OnInit, ViewChild, ElementRef  } from '@angular/core';
import { NgModule } from '@angular/core';
//import * as io from 'socket.io-client';
import io from 'socket.io-client';

interface Message {
  username: string;
  message: string;
  time: string;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})

export class ChatComponent implements OnInit {
  private socket = io('http://localhost:4000');

  name: string = '';
  room: string = '';
  jroom: string = '';
  message: string='';
  messages: Message[] = [];
  rooms: any = {};
  hideFirstDiv: boolean = false;
  hideSecondDiv: boolean = true;
  hideThirdDiv: boolean = true;
  roomId: string = "";
  newMessage: string='';
  myMap = new Map<string, string>();
  key: any;

  constructor() {}

  ngOnInit() {
    this.socket.on('connection', () => {
      console.log('Connected to server');
    });
    this.socket.on('ROOMS', (rooms: {[key: string]: any}) => {
      this.myMap = new Map<string, string>();
      for (let key in rooms) {
        this.myMap.set(key, rooms[key].name);
      }
    });
    this.socket.on('JOINED_ROOM', (value: string) => {
      this.roomId = value;
      this.messages = [];
      this.hideThirdDiv= false;
      this.hideSecondDiv = true;
    });
    this.socket.on('ROOM_MESSAGE', ({message, username, time}) => {
      this.messages.push({ username: username, message: message, time: time });
    });

  }
  submitName() {
    this.hideFirstDiv = true;
    this.hideSecondDiv = false;
  }

  sendMessage() {
    if (!this.newMessage.trim()) {
      return;
    }

    this.socket.emit('SEND_ROOM_MESSAGE', { roomId: this.roomId, message: this.newMessage, username: this.name });

    const date = new Date();

    this.messages.push({
      username: this.name,
      message: this.newMessage,
      time: `${date.getHours()}:${date.getMinutes()}`
    });
    this.newMessage = "";
  }
  @ViewChild('newRoom') newRoomRef!: ElementRef;
  handleCreateRoom() {
    //get the room name
    const roomName = this.newRoomRef.nativeElement.value || "";

    if (!String(roomName).trim()) return;

    // emit room created event
    this.socket.emit('CREATE_ROOM', { roomName });

    // set room name input to empty string
    this.newRoomRef.nativeElement.value = "";
  }
  joinRoom(value: string) {
    this.key=getKeyByValue(value,this.myMap);
    this.socket.emit('JOIN_ROOM', this.key);
  }
  
}

function getKeyByValue(value: string, myMap: Map<string, string>): string | undefined {
  let result: string | undefined;

  myMap.forEach((val, key) => {
    if (val === value) {
      result = key;
      return;
    }
  });

  return result;
}

