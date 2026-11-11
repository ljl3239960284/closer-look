# Closer Look

A fullscreen photography and film portfolio built with HTML, CSS and JavaScript.

![Five numbered photography bookmarks in the desktop gallery](docs/bookmarks.jpg)

The desktop gallery uses tall covers that reveal on hover or keyboard focus. Each cover has its own crop so a narrow column still frames the subject. The series scroll horizontally in narrower desktop windows. The touch layout stacks the bookmarks vertically. The first tap wipes a photograph across the entire bookmark and shows an explicit way to enter the series. Each horizontal cover has its own focal point to keep its subject in the frame.

Inside each series, use the arrows or scroll to move through the photographs. The page counter follows your position, and closing the gallery returns focus to the bookmark. The interface respects reduced-motion preferences.

The opening page reveals a photograph and gives direct routes to the photography and film. Its pointer movement and opening animation respect reduced-motion preferences. The film opens from its still into a YouTube dialog. Closing the dialog unloads the player and returns focus to the still.

Open [index.html](index.html) in a browser to run the gallery. The public demo uses abstract covers. Private media and the film URL are configured separately in photo-mode.js. No dependencies or build step are required.

The early gradient and lens exploration drew inspiration from [Purrweb's portfolio study](https://dribbble.com/shots/19871911-Landing-Designer-portfolio).
