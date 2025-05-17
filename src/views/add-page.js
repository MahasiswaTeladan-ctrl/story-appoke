import './story-form.js';

const AddPage = {
  async render() {
    return `
      <div class="page-container">
        <div class="add-story-container">
          <h2>Tambah Cerita Baru</h2>
          <story-form></story-form>
        </div>
      </div>
    `;
  },

  async afterRender() {}
};

export default AddPage;