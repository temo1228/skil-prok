(function (root) {
 class PlaylistStore {
  constructor(storage) {
   this.storage = storage;
   this.items = [];
   try {
    const parsed = JSON.parse(storage.getItem('groove-playlists') || '[]');
    if (Array.isArray(parsed)) this.items = parsed.filter(p => p && typeof p.id === 'string' && typeof p.name === 'string' && Array.isArray(p.songIds)).map(p => ({id:p.id,name:p.name,description:typeof p.description === 'string' ? p.description : '',songIds:[...new Set(p.songIds.filter(id => typeof id === 'string'))]}));
   } catch {}
  }
  commit(items) { this.storage.setItem('groove-playlists',JSON.stringify(items)); this.items = items; }
  create(name, description = '') {
   name = name.trim().slice(0,80); if (!name) throw new Error('Give your playlist a name.');
   const item = {id:'playlist-' + crypto.randomUUID(),name,description:description.trim().slice(0,240),songIds:[]};
   this.commit([...this.items,item]); return item;
  }
  get(id) { return this.items.find(p => p.id === id); }
  edit(id,name,description) {
   name = name.trim().slice(0,80); if(!name) throw new Error('Give your playlist a name.');
   this.commit(this.items.map(p => p.id === id ? {...p,name,description:description.trim().slice(0,240)} : p));
  }
  add(id,songId) { const p = this.get(id); if(!p) throw new Error('Playlist not found.'); if(p.songIds.includes(songId)) return false; this.commit(this.items.map(p => p.id === id ? {...p,songIds:[...p.songIds,songId]} : p)); return true; }
  remove(id,songId) { this.commit(this.items.map(p => p.id === id ? {...p,songIds:p.songIds.filter(s => s !== songId)} : p)); }
  delete(id) { this.commit(this.items.filter(p => p.id !== id)); }
 }
 if (typeof module !== 'undefined' && module.exports) module.exports = PlaylistStore;
 else root.PlaylistStore = PlaylistStore;
})(globalThis);
