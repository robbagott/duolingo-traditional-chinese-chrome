import { openDB, deleteDB } from 'idb';
import cedict from './cedict.json';

const dbName = 'duolingo-traditional-chinese';

let upgraded = false;
if (chrome.storage.local.get('duolingoTraditionalChineseInitializeStarted') && 
    !chrome.storage.local.get('duolingoTraditionalChineseInitialized')) {
  console.log('deleting db');
  deleteDB()
    .then(initializeDb)
    .catch(err => console.error('Failed to delete DB', err));
} else {
  initializeDb();
}

function initializeDb() {
  console.log('opening db');
  openDB(dbName, 1, {
    upgrade: (db, oldVersion, newVersion, transaction) => {
      console.log('upgrading');
      const objStore = db.createObjectStore('cedict', { keyPath: 'key'});
      objStore.createIndex('traditional', 'traditional');
      upgraded = true;
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
  }).then(populateData)
    .catch(err => console.error(err));
}

function populateData(db) {
  if (upgraded) {
    console.log('populating data');
    chrome.storage.local.set({ duolingoTraditionalChineseInitializeStarted: true });
    const tx = db.transaction('cedict', 'readwrite');
    const additions = [];
    let counter = 0;
    cedict.forEach((entry) => {
      entry.key = counter++;
      additions.push(tx.store.add(entry));
    });

    Promise.all(additions).then(() => {
      console.log('done populating');
      chrome.storage.local.set({ duolingoTraditionalChineseInitialized: true });
      return db;
    }).then(listen)
      .catch((err) => console.error(err));
  } else {
    listen(db);
  }
}

function listen(db) {
  console.log('listening');
  chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    console.log('received request', req, sender);
    if (req.type === 'query') {
      db.getAllFromIndex('cedict', 'traditional', req.payload).then(res => {
        console.log('found character info', res);
        sendResponse(res);
      });
      return true;
    }
  });
}
