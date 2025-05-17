import HomePagePresenter from '../presenters/home-presenter.js';
import './story-item.js';

const HomePage = {
  async render() {
    return `
      <div class="page-container">
        <h2>Daftar Cerita</h2>
        <div class="story-list" id="story-list"></div>
        <div id="map" style="width: 100%; height: 400px;"></div>
        <div id="offline-message" style="display:none; color:#e74c3c; text-align:center; margin-top:1rem;">Kamu sedang offline. Data yang tampil adalah data terakhir yang tersimpan.</div>
      </div>
    `;
  },

  async afterRender() {
    console.log('HomePage afterRender dipanggil');
    try {
      const stories = await HomePagePresenter.loadStories();
      console.log('HomePagePresenter.loadStories selesai, jumlah:', stories.length);
      const listContainer = document.getElementById('story-list');
      const mapContainer = document.getElementById('map');
      const offlineMsg = document.getElementById('offline-message');
      
      listContainer.innerHTML = '';

      this._initMap(mapContainer);

      requestAnimationFrame(() => {
        this.map.invalidateSize();
      });

      if (stories.length === 0) {
        listContainer.innerHTML = '<p style="text-align:center; color:#888;">Tidak ada cerita yang bisa ditampilkan.</p>';
      } else {
        stories.forEach((story) => {
          const storyItem = document.createElement('story-item');
          storyItem.story = story;
          listContainer.appendChild(storyItem);
          this._addMarkerToMap(story);
        });
      }

      // Tampilkan pesan offline jika tidak ada koneksi
      if (!navigator.onLine) {
        offlineMsg.style.display = 'block';
      }
    } catch (error) {
      console.error('Error in HomePage afterRender:', error);
      document.getElementById('story-list').innerHTML = '<p style="text-align:center; color:#e74c3c;">Gagal memuat cerita. Cek koneksi internet kamu.</p>';
      document.getElementById('offline-message').style.display = 'block';
    }
  },

  _initMap(mapContainer) {
    if (this.map) {
      this.map.remove(); 
      this.map = null;
    }

    this.map = L.map(mapContainer).setView([-6.200000, 106.816666], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);
  },

  _addMarkerToMap(story) {
    const { lat, lon } = story;
  
    if (lat && lon) {
      const markerIcon = L.divIcon({
        className: 'emoji-marker',
        html: '📍',
        iconSize: [30, 30],
      });

      const marker = L.marker([lat, lon], { icon: markerIcon }).addTo(this.map);

      marker.bindPopup(
        `<strong>${story.name}</strong><br>
         ${story.description}<br>
         Dibuat pada: ${new Date(story.createdAt).toLocaleDateString()}<br>
         Lokasi: Lat: ${lat}, Lon: ${lon}<br>`
      );
    }
  }
};

export default HomePage;