class StoryItem extends HTMLElement {
  set story(data) {
    this._story = data;
    this.render();
  }

  render() {
    const storyDate = new Date(this._story.createdAt).toLocaleDateString();

    this.innerHTML = `
      <div class="story-card">
        <img src="${this._story.photoUrl}" alt="Foto oleh ${this._story.name}">
        <div class="card-content">
          <h3>${this._story.name}</h3>
          <p>${this._story.description}</p>
          <p><small>Dibuat pada: ${storyDate}</small></p>
        </div>
      </div>
    `;
  }
}

customElements.define('story-item', StoryItem);