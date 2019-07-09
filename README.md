

# sub ![subhuman-logo](/images/logo_32.png) human

For every other human who doesn't like to be tracked.

## what?

This is a Chrome extension app that tracks and exposes in-browser tracking pixels or pixel tags common deployed by marketing emails known as **read receipts**.

It gives you simple options to:

+ Block all images
+ Expose the pixel tracker
+ Send DOS-like repetive requests to the source.

## block

Blocks all requests to image automatically.

## expose

The extension finds a suspicious `<img>` with width and height of 1 and swap it with a hovering drone sentinel so you can see it right away.

## retaliate

Uses a pool of [Web Workers](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers) to repetively fetch the pixel trackers from the source's server. If the pixel tracker was used as a read receipt, it would likely appear as if you opened the mail hundreds of times.

## milestone

Not in this order:

+ Better Web Workers optimization
+ Distributed server-side attacks
+ Options to choose image substitution
+ Better attack animation
