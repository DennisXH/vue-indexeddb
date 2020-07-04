const DB_NAME = 'review-db';
const DB_VERSION = 1;
const STORE_RESTAURANT_NAME = 'restaurants';
const STORE_COMMENT_NAME = 'comments';

const getDb = async () => {
  return new Promise((resolve, reject) => {
    
    let request = window.indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = e => {
      console.log('Error opening db', e);
      reject('Error');
    };
    
    request.onsuccess = e => {
      resolve(e.target.result);
    };
    
    request.onupgradeneeded = e => {
      console.log('onupgradeneeded');
      let db = e.target.result;
      let restaurantStore = db.createObjectStore(STORE_RESTAURANT_NAME, { autoIncrement: true, keyPath:'id' });
      let commentStore = db.createObjectStore(STORE_COMMENT_NAME, { autoIncrement: true, keyPath:'id' });
    };
  });
};

const generateRestaurant = () => ({
  name: "Restaurant " + Math.floor(Math.random() * 100),
  address: Math.floor(Math.random() * 1000) + " Test St, Vancouver",
  phone: "778" + Math.floor(Math.random() * 10000000)
})



const comment = {
  username: '',
  restaurant_id: '',
  comments: ''
};

const app = new Vue({
  el: '#app',
  getDb,
  generateRestaurant,
  comment,
  data: {
    db:null,
    ready: false,
    addDisabled:false,
    restaurants: [],
    comments: [],
    comment: comment,
    displayRestaurants: false,
    displayComments: true
  },
  async created() {
    this.db = await getDb();
    this.restaurants = await this.getRestaurants();
    if (this.restaurants.length < 1000) {
      this.addRestaurantToDb();
      this.restaurants = await this.getRestaurants();
    }
    this.comments = await this.getComments();
    this.ready = true;
  },
  methods: {
    showComments() {
      this.displayComments = true;
      this.displayRestaurants = false;
    },
    showRestaurants() {
      this.displayComments = false;
      this.displayRestaurants = true;
    },
    async deleteComment(commentId) {
      await this.deleteCommentFromDb(commentId);
      this.comments = await this.getComments();
    },
    async deleteCommentFromDb(commentId) {
      return new Promise((resolve, reject) => {
        let trans = this.db.transaction([STORE_COMMENT_NAME],'readwrite');
        trans.oncomplete = e => {
          resolve();
        };
    
        let store = trans.objectStore(STORE_COMMENT_NAME);
        store.delete(commentId);
      });
    },
    async addRestaurantToDb() {
      return new Promise((resolve, reject) => {
    
        let trans = this.db.transaction([STORE_RESTAURANT_NAME],'readwrite');
        trans.oncomplete = e => {
          resolve();
        };
    
        let store = trans.objectStore(STORE_RESTAURANT_NAME);
        for(let i = 0; i < 1000; i++){
          store.add(generateRestaurant());
        }
      });
    },
    async addComment() {
      await this.addCommentToDb(this.comment);
      this.comments = await this.getComments();
    },
    async addCommentToDb(comment) {
      return new Promise((resolve, reject) => {
    
        let trans = this.db.transaction([STORE_COMMENT_NAME],'readwrite');
        trans.oncomplete = e => {
          resolve();
        };
    
        let store = trans.objectStore(STORE_COMMENT_NAME);
        store.add(comment);
      });
    },
    async getRestaurants() {
      return new Promise((resolve, reject) => {
    
        let trans = this.db.transaction([STORE_RESTAURANT_NAME],'readonly');
        trans.oncomplete = e => {
          resolve(restaurants);
        };
    
        let store = trans.objectStore(STORE_RESTAURANT_NAME);
        let restaurants = [];
    
        store.openCursor().onsuccess = e => {
          let cursor = e.target.result;
          if (cursor) {
            restaurants.push(cursor.value);
            cursor.continue();
          }
        };
    
      });
    },
    async getComments() {
      return new Promise((resolve, reject) => {
    
        let trans = this.db.transaction([STORE_COMMENT_NAME],'readonly');
        trans.oncomplete = e => {
          resolve(comments);
        };
    
        let store = trans.objectStore(STORE_COMMENT_NAME);
        let comments = [];
    
        store.openCursor().onsuccess = e => {
          let cursor = e.target.result;
          if (cursor) {
            comments.push(cursor.value);
            cursor.continue();
          }
        };
    
      });
    }
  }
});