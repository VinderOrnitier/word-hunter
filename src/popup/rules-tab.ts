export class RulesTab {
  constructor(private container: HTMLElement) {}

  async init(): Promise<void> {
    this.container.innerHTML = `
      <div data-testid="rules-tab" class="rules-tab">
        <h2>How the word gets hidden</h2>
        <p>
          The word is hidden only inside text blocks that contain
          <strong>50 or more words</strong>. This ensures the word
          blends in naturally and the game stays fair.
        </p>
        <p>
          Any page with enough text qualifies — articles, blog posts,
          Wikipedia pages, and more.
        </p>
        <h3>Why wasn't the word hidden on this page?</h3>
        <p>
          If the page has only short text, images, or video, there is
          nowhere to hide the word. In that case a notification appears
          at the top of the screen to let you know.
        </p>
      </div>
    `;
  }
}
