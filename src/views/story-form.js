import L from 'leaflet';
import StoryFormPresenter from '../presenters/story-form-presenter.js';

class StoryForm extends HTMLElement {
  connectedCallback() {
    this.render();
    this._initCamera();
    this._initMap();
    this._handleFormSubmit();
    this._handleFileUpload();
  }

  render() {
    this.innerHTML = `
      <form id="story-form">
        <label for="description">Deskripsi:</label><br>
        <textarea id="description" name="description" required></textarea><br><br>

        <label for="photo">Ambil Foto:</label><br>
        <video id="camera" width="300" autoplay></video><br>
        <button type="button" id="capture">Ambil Gambar</button><br><br>
        <canvas id="canvas" width="300" style="display: none;"></canvas><br>

        <label for="photoFile">Atau Upload Foto:</label><br>
        <input type="file" id="photoFile" accept="image/*"><br><br>

        <label for="location">Pilih Lokasi:</label><br>
        <div id="map" style="width: 300px; height: 200px;"></div><br>
        <input type="hidden" id="lat" name="lat">
        <input type="hidden" id="lon" name="lon">
        <div id="coordinates"></div><br>

        <button type="submit">Kirim Cerita</button>
        <div id="spinner" style="display: none;">Loading...</div>
      </form>
    `;
  }

  _initCamera() {
    this.videoElement = this.querySelector('#camera');
    const canvas = this.querySelector('#canvas');
    const captureButton = this.querySelector('#capture');

    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        this.videoElement.srcObject = stream;
      })
      .catch((error) => {
        console.error('Kamera gagal diakses:', error);
        alert('Kamera gagal diakses. Pastikan sudah memberi izin.');
      });

    captureButton.addEventListener('click', () => {
      canvas.style.display = 'block';
      const context = canvas.getContext('2d');
      context.drawImage(this.videoElement, 0, 0, canvas.width, canvas.height);
      this._uploadedPhotoDataUrl = null;
    });
  }

  _handleFileUpload() {
    const fileInput = this.querySelector('#photoFile');
    const canvas = this.querySelector('#canvas');

    fileInput.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this._uploadedPhotoDataUrl = reader.result;
          
          const img = new Image();
          img.onload = () => {
            canvas.style.display = 'block';
            const context = canvas.getContext('2d');
            context.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = reader.result;
          
          this._stopCamera();
        };
        reader.readAsDataURL(file);
      }
    });
  }

  _initMap() {
    this.map = L.map(this.querySelector('#map')).setView([-7.3319, 110.4927], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    const markerIcon = L.divIcon({
      className: 'emoji-marker',
      html: '📍',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    this.map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      this.querySelector('#lat').value = lat;
      this.querySelector('#lon').value = lng;
      this._updateCoordinatesDisplay(lat, lng);

      if (this.marker) {
        this.marker.setLatLng(e.latlng);
      } else {
        this.marker = L.marker(e.latlng, { icon: markerIcon, draggable: true }).addTo(this.map);

        this.marker.on('drag', (event) => {
          const { lat, lng } = event.target.getLatLng();
          this.querySelector('#lat').value = lat;
          this.querySelector('#lon').value = lng;
          this._updateCoordinatesDisplay(lat, lng);
        });

        this.marker.on('dragend', (event) => {
          const { lat, lng } = event.target.getLatLng();
          this.querySelector('#lat').value = lat;
          this.querySelector('#lon').value = lng;
          this._updateCoordinatesDisplay(lat, lng);
        });
      }
    });
  }

  _updateCoordinatesDisplay(lat, lon) {
    const coordinatesDiv = this.querySelector('#coordinates');
    coordinatesDiv.innerHTML = `Lat: ${lat.toFixed(6)}, Lon: ${lon.toFixed(6)}`;
  }

  _handleFormSubmit() {
    const form = this.querySelector('#story-form');
    const spinner = this.querySelector('#spinner');
    const submitButton = form.querySelector('button[type="submit"]');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      submitButton.disabled = true;

      const description = this.querySelector('#description').value;
      const lat = this.querySelector('#lat').value;
      const lon = this.querySelector('#lon').value;
      const canvas = this.querySelector('#canvas');

      let photo;
      if (this._uploadedPhotoDataUrl) {
        photo = this._uploadedPhotoDataUrl;
      } else {
        photo = canvas.toDataURL('image/jpeg');
      }

      if (!description || !lat || !lon || !photo) {
        alert('Semua kolom harus diisi dan foto harus diambil!');
        submitButton.disabled = false;
        return;
      }

      spinner.style.display = 'block';

      try {
        const result = await StoryFormPresenter.postStory(description, photo, lat, lon);
        console.log(result);

        this._stopCamera();

        alert('Cerita berhasil ditambahkan!');
        
        if (document.startViewTransition) {
          document.startViewTransition(() => {
            window.location.hash = '/';
            window.scrollTo(0, 0);
          });
        } else {
          window.location.hash = '/';
          window.scrollTo(0, 0);
        }

      } catch (error) {
        console.error(error);
        alert('Gagal menambahkan cerita.');
      } finally {
        spinner.style.display = 'none';
        submitButton.disabled = false;
      }
    });
  }

  _stopCamera() {
    if (this.videoElement) {
      const stream = this.videoElement.srcObject;
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
      }
      this.videoElement.srcObject = null;
    }
  }

  disconnectedCallback() {
    this._stopCamera();
  }
}

customElements.define('story-form', StoryForm);