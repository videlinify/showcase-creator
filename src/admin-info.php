<?php
function psc_info_page() {
  global $_psc;
  $_psc->modules_init('foldable-panel');
  ?>
  <h1 class="psc-title-font psc-title"><?php PSC::_e('Showcase Creator'); ?></h1>
  <div class="psc-admin-container" style="justify-content: flex-end;">
    <div class="psc-flex-row psc-flex-gap-plus">
      <a class="button-secondary psc-font-size-plus" href="https://videlinify.com/showcase-creator/feedback/" target="_blank">&#9993; <?php PSC::_e('Report a bug'); ?></a>
      <a class="button-secondary psc-font-size-plus" href="https://videlinify.com/showcase-creator/layouts/" target="_blank">&#128396; <?php PSC::_e('Additional layouts'); ?></a>
      <a class="button-secondary psc-font-size-plus" href="https://videlinify.com/showcase-creator/doc/" target="_blank">&#128214; <?php PSC::_e('Full documentation'); ?></a>
      <a class="button-secondary psc-font-size-plus" href="https://videlinify.com/showcase-creator/donate/" target="_blank">&hearts; <?php PSC::_e('Donate'); ?></a>
    </div>
  </div>
  <div class="psc-admin-container" style="flex-flow: row nowrap;">
    <div class="psc-admin-box vid-foldable-panel psc-flex-grow">
      <div class="vid-foldable-panel-header"><?php PSC::_e('Features'); ?></div>
      <div class="vid-foldable-panel-body">
        <?php PSC::_e('
          <h4>A Gutenberg Block for displaying posts:</h4>
          <ul>
            <li>With the Showcase Creator Gutenberg block, you can add a post showcase anywhere in a page, a sidebar or other editable content.</li>
            <li>Advanced post filters help you filter posts by post type, taxonomies, date, authors.</li>
            <li>The post showcase is rendered using a custom layout.</li>
            <li>You can sort posts by custom list, date, title, comments, meta key, author, random, etc.</li>
            <li>You can include or exclude posts or authors.</li>
            <li>Some more filters like showing posts with featured image only.</li>
          </ul>
          <h4>Layout Builder to create custom showcase layouts:</h4>
          <ul>
            <li>Elements to display for each post: Title, Date, Author, Excerpt, Thumbnail, Tags, Categories and more...</li>
            <li>Elements can be customized.</li>
            <li>Special layout functionality like carousel slider or masonry order.</li>
            <li>CSS code editor to style your layouts.</li>
            <li>Ready-made layouts (Post blocks, Gallery view, Slider...) that can be modified.</li>
            <li>Import and export layouts.</li>
          </ul>
          <h4>Create lists of custom ordered posts.</h4>
          <ul>
            <li>Easily find posts to add to the list using post filters.</li>
            <li>Option to associate the list with a category for example to automatically add new posts to that list.</li>
            <li>Display the custom ordered post lists using the Showcase Creator Gutenberg Block.</li></ul></li>
          </ul>
          <h4>Integrate a layout to replace the main template in a search query, category view, or author view.</h4>
          <h4>Exporting and importing plugin data.</h4>'); ?>
      </div>
    </div>
    <div class="psc-admin-box vid-foldable-panel psc-flex-grow" style="max-width: 50%;">
      <div class="vid-foldable-panel-header"><?php PSC::_e('FAQ'); ?></div>
      <div class="vid-foldable-panel-body">
        <?php PSC::_e('
          <h4>How do I use the plugin?</h4>
          <ol>
            <li>Create a layout or rely on a ready-made one.</li>
            <li>Use the Showcase Gutenberg Block to filter and display posts on a page.</li>
          </ol>');
          PSC::_e('
          <h4>How do I display posts?</h4>
          <ol>
            <li>Create a page.</li>
            <li>Insert a Showcase Gutenberg Block.</li>
            <li>Choose a layout.</li>
            <li>Set up the block\'s options to filter the posts you want to display.</li>
            <li>Save the page and preview it in your browser.</li>
          </ol>');
          PSC::_e('
          <h4>How do I make a layout?</h4>
          <ul>
            <li>In the Showcase Creator admin menu, select Layouts.</li>
            <li>From there, you can duplicate or edit an existing layout, or you can start from scratch by clicking on Add new layout.</li>
            <li>First you need to name your layout.</li>
            <li>In the Constructor, you can add new elements, set their functions, and organize them into groups by moving and wrapping them in wrappers. Each element is like a HTML tags that can have different dynamic content based on the currently displayed post. The elements you want to style must have a class that you will be using in the Style editor. The Style editor is where you make your layout look the way you want. You must be familiar with CSS to use it. If you are new to CSS, try   duplicating a ready-made layout and changing its colors and stuff.</li>
            <li>In the Style editor you can also add or edit media queries to implement a responsive design.</li>
            <li>Preview your layout by clicking the Preview tab at the bottom of the screen. This will open the preview window. You can resize and scale it.</li>
          </ul>');
          PSC::_e('
          <h4>How to create a list of user-ordered posts and display them?</h4>
          <ol>
            <li>Click on Order posts in the Showcase creator admin menu.</li>
            <li>Create a list.</li>
            <li>Find posts and add them to the list.</li>
            <li>Save your list.</li>
            <li>Insert a Showcase Gutenberg Block in a page.</li>
            <li>Set the Order by option to Custom list and select the list you created.</li>
          </ol>');
          PSC::_e('
          <h4>How to display search results using one of my layouts?</h4>
          <ol>
            <li>Go to the admin menu of the Showcase creator and click on Settings.</li>
            <li>Turn on "Replace WP search queries" toggle.</li>
            <li>Select a layout to display the results.</li>
            <li>Update settings.</li>
          </ol>');
          PSC::_e('
          <h4>How to export and import plugin data?</h4>
          <ul>
            <li>When editing a layout, you can export it using the <i>Save to file</i> button.</li>
            <li>Importing layouts is possible from the Layouts menu using the <i>Import from file</i> button.</li>
            <li>To mass export and import layouts and order lists, use the corresponding buttons in the Settings menu.</li>
          </ul>'); ?>
      </div>
    </div>
  </div>
  <?php
}
