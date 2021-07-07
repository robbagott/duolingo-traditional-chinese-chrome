import '@babel/polyfill';
import { openDB, deleteDB } from 'idb';

const dbName = 'duolingo-traditional-chinese';
const cedictTable = 'cedict';
const mmhTable = 'mmhdict'

start();

async function start() {
  if (extensionFailedInitialize()) {
    console.log('deleting db');
    try {
      await deleteDB()
    } catch (e) {
      console.error(e);
    }
  } 
  const { db, upgraded } = await initializeDb();
  if (upgraded) {
    await populateData(db);
  }
  listen(db);
}

function extensionFailedInitialize() {
  return chrome.storage.local.get('duolingoTraditionalChineseInitializeStarted') && 
         !chrome.storage.local.get('duolingoTraditionalChineseInitialized');
}

async function initializeDb() {
  let upgraded = false;
  try {
    const db = await openDB(dbName, 1, {
      upgrade: (db, oldVersion, newVersion, transaction) => {
        console.log('upgrading');
        const ceStore = db.createObjectStore(cedictTable, { keyPath: 'key' });
        ceStore.createIndex('traditional', 'traditional');

        const mmhStore = db.createObjectStore(mmhTable, { keyPath: 'character' });
        mmhStore.createIndex('character', 'character');
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
    });
    return { db, upgraded };
  } catch (e) {
    console.log(e);
  }
}

async function populateData(db) {
  try {
    // Populate Cedict data.
    console.log('populating data');
    chrome.storage.local.set({ duolingoTraditionalChineseInitializeStarted: true });
    const cedict = await readCedict();
    const ceTx = db.transaction(cedictTable, 'readwrite');
    let additions = [];
    let counter = 0;
    cedict.forEach(entry => {
      entry.key = counter++;
      additions.push(ceTx.store.add(entry));
    });
    await Promise.all(additions)

    // Populate MakeMeAHanzi data.
    const mmhData = await readMmh();
    additions = [];
    const mmhTx = db.transaction(mmhTable, 'readwrite');
    mmhData.forEach((entry, i) => {
      if (entry.character) {
        additions.push(mmhTx.store.add(entry));
      }
    });
    await Promise.all(additions);
    console.log('done populating');
    chrome.storage.local.set({ duolingoTraditionalChineseInitialized: true });
    return db;
  } catch (e) {
    console.log(e);
  }
}

function listen(db) {
  console.log('listening');
  chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    console.log('received request', req, sender);
    if (req.type === 'query') {
      new Promise(async (resolve, reject) => {
        const cedictInfo = await db.getAllFromIndex(cedictTable, 'traditional', req.payload);
        const mmhInfo = await db.getFromIndex(mmhTable, 'character', req.payload);
        let res = {};
        cedictInfo.sort((a, b) => {
          if (a.pinyin < b.pinyin) {
            return 1;
          } else {
            return -1;
          }
        });
        console.log(cedictInfo);
        res = {
          definitions: cedictInfo
        };
        res.extended = mmhInfo;
        resolve(res);
      }).then(res => {
        sendResponse(res);
      });
      return true;
    }
  });
}

async function readMmh() {
  try {
    const url = chrome.runtime.getURL('makemeahanzi-dictionary.txt');
    const res = await fetch(url);
    const mmhData = (await res.text()).split('\n');
    mmhData.forEach((entry, i) => {
      if (entry) {
        mmhData[i] = JSON.parse(entry);
      }
    });
    return mmhData;
  } catch (e) {
    console.log(e);
  }
}

async function readCedict() {
  try {
    const url = chrome.runtime.getURL('cedict.json');
    const res = await fetch(url);
    const cedict = await res.json();
    return cedict;
  } catch (e) {
    console.log(e);
  }
}
