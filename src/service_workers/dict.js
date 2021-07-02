import { openDB, deleteDB } from 'idb';
import cedict from './cedict.json';

openDB('duolingo-traditional-chinese', 1, {
  upgrade: (db, oldVersion, newVersion, transaction) => {
    const objStore = db.createObjectStore('cedict', { keyPath: 'traditional'});
  },
  blocked: () => {
    console.log('blocked');
  },
  blocking: () => {
    console.log('blocking');
  },
  terminated: () => {
    console.log('terminated');
  }
});




