# Brand images

- `assets/img/logo.svg` / `logo-512.png`: the "ae" monogram (ink tile, teal orbit, copper dot).
- `assets/img/share-card.png` (1200 × 630): the image LinkedIn and other sites show when a lab article is shared.

To regenerate a PNG after editing the HTML here (fonts load from Google Fonts):

```sh
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless=new --hide-scrollbars --window-size=1200,630 --virtual-time-budget=8000 \
  --screenshot="$PWD/assets/img/share-card.png" "file://$PWD/scripts/brand/share-card.html"
"$CH" --headless=new --hide-scrollbars --default-background-color=00000000 --window-size=512,512 \
  --virtual-time-budget=6000 --screenshot="$PWD/assets/img/logo-512.png" "file://$PWD/scripts/brand/logo.html"
```
