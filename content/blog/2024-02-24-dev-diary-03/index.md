---
title: "iCloud and screen sizes"
permalink: /dev-diary-03/
description: Storing important data to the cloud, and adjusting layouts based on screen sizes
date: 2024-02-24
tags:
  - dev
  - dev-diary
---

Last week I launched my [Reps app on TestFlight](https://testflight.apple.com/join/Keq4Mca2) for any curious early testers to try out. This week I looked into how I can persist recorded data, and adjusted layouts for smaller screens.

## TODO Check-in

Last week I set out a bunch of tasks of various sizes that I hoped to tackle this week. I managed to clear up most of them, including:

- Adjusting the exercise layout to move "Sets 1 of 2" to a better position
- Added the "Saving..." flow to the timer view
- Persisting the measured seconds amount in timer when switching to "Manual"
- Making animations invisible when scrolling between exercises (hoping to make that transition smoother)

For the latter, I used a state variable `isScrolling` to determine when the `scrollTo` action is called, and when true set the animation's opacity to `0`. I added a bit of animation too, like so:

```swift
.opacity(isScrolling ? 0 : 1)
.animation(.easeOut, value: isScrolling)
```

The tricky part though was setting `isScrolling` to true. This had to happen within a child view, so I passed the Bool in as a `Binding`, so I can change it in the child view's saving action. This seems to work well.

So after these optimisations, I also took on some new items this week. Saving to iCloud, and optimising for smaller screens.

## iCloud

There are two types of data stored in my app. One is `UserDefaults`, which includes things like the current weekly training routine and the user's progression level in each exercise. The other is the `Journal` data, which is stored in `SwiftData`.

I've not managed to work out an easy way to backup and sync the `UserDefaults` yet, though I believe there are ways to do so (I could for example check if the `UserDefault` values are not set, then check for an iCloud version of same to hydrate them on first use - maybe next week).

So I decided to make use of [this handy guide on saving SwiftData to iCloud](https://www.hackingwithswift.com/quick-start/swiftdata/how-to-sync-swiftdata-with-icloud). Turns out it was very easy, once I'd activated `iCloud` in the `Signing & Capabilities settings` section. One change I did have to make was to give my model default values in the `init` method. Once I had done that, I could see the syncing happening in the console when testing locally and on-device.

So now, if I reinstall the app, it should pull down the important training history.

## Screen size adjustments

I found that my record exercise screens were overflowing the height of smaller screen phones such as the `iPhone SE` and `12 Mini`. To work around this, I decided to adjust the size of various elements based on the given screen height.

To get this, I found an extension for `UIScreen` (in [this StackOverflow answer](https://stackoverflow.com/a/58321449)):

```swift
extension UIScreen {

    /// Retrieve the (small) width from portrait mode
    static var portraitWidth : CGFloat { return min(UIScreen.main.bounds.width, UIScreen.main.bounds.size.height) }

    /// Retrieve the (big) height from portrait mode
    static var portraitHeight : CGFloat { return max(UIScreen.main.bounds.size.width, UIScreen.main.bounds.size.height)  }

    /// Retrieve the (big) width from landscape mode
    static var landscapeWidth : CGFloat { return max(UIScreen.main.bounds.size.width, UIScreen.main.bounds.size.height) }

    /// Retrieve the (small) height from landscape mode
    static var landscapeHeight : CGFloat { return min(UIScreen.main.bounds.size.width, UIScreen.main.bounds.size.height) }
}
```

Using this I checked for screens under 700 points in height, and set the animation size to a smaller value. I think I'll need to do more testing when I revisit the design, as it's very rough currently, but at least it works. Small steps!

## Current TODO list

Based on what I learned this week, I'd like to work on the following this week:

- Adding iCloud backup for UserDefaults
- Setting up mock Journal data so I can start working on the journal view
- Planning a "Progression indicator" value which could help inform people when it's time to progress to the next level

The last one is going to be a core feature of this app, and one I'd hope to refine over time. I've got to start somewhere though so I think I'll aim for something super-simple and work from there.

Thanks for reading, and if you want to see my app as it is built, feel free to [download Reps on TestFlight](https://testflight.apple.com/join/Keq4Mca2).
