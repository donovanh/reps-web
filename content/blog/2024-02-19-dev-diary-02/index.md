---
title: "Reps Dev Diary #2: TestFlight & Timers"
permalink: /dev-diary-02/
description: Some early testing, feedback and improvements
date: 2024-02-19
tags:
  - dev
  - dev-diary
---

Last week I launched my [Reps app on TestFlight](https://testflight.apple.com/join/Keq4Mca2) for any curious early testers to try out. I also started using it properly myself and as a result, I've a long list of things I really want to improve right away.

## TestFlight: No testing like user testing

No matter how much time spent going through user flows in the simulator, it's an entirely different experience using an app for real on a device. In my case, when I started using my app in the morning to log a workout, I immediately spotted a bunch of small (and large) issues.

I also wanted to bring in some external testers to try to get some feedback. To do this I enrolled in [App Store Connect](https://appstoreconnect.apple.com), which included a €99-per-year fee, and [pushed an archive of my app to TestFlight](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases).

The process of creating a release and then submitting it for review was fairly straightforward. One thing I needed to do was create a [Reps app website](https://reps.hop.ie) with a [privacy policy](https://reps.hop.ie/privacy/). To do this I set up a quick [11ty](https://www.11ty.dev) project and deployed it to Github Pages.

I then set up a public group in App Store Connect and when my TestFlight was reviewed I could start sharing the link.

## Deploy schedule

It's very easy to deploy new versions of apps to TestFlight. I'm glad it is because I at one point managed to push a version with an important feature commented out. I was able to expire the old version and upload a new within minutes.

Generally though I'm going to aim to release a new version once every week or so, barring emergency fixes.

## Initial feedback

So far I've quickly amassed a list of things I want to improve. In the first week the main issues were:

- Some late-updating quirks in the UI
- The "Log x reps" button jumps too suddenly to the next exercise, which feels jarring
- It's a hassle to have to leave the app to start a timer for timed exercises

Last weekend I set out to address these issues.

### UI state out of sync

Firstly, I refactored the way I store the UI state into one central ViewModel class for the main view. I had been tracking the state with two separate classes and trying to update them as needed, but without a central source of truth the UI was partially-updating at times. This pushes those two models into a role of background-storage and initial-state, and then my main ViewModel is responsible for keeping the current state and pushing updates into those models for storage. Seems to make things more solid.

I still end up instatiating the main ViewModel and then passing it down to children views, which feels a little sub-optimal but it's working for now until I find a way to properly use the local Environment to store the class.

### Logging reps button

To help with this issue, I wanted to make it clear when reps were being saved. I also thought it would be helpful to have a `Cancel` option, as I've been hearing a lot about phantom clicks from Vision Pro users, and this can easily happen on any touch devices.

To address this, I added a `Task` to the saving action that sets `isSavingReps` to true, while awaiting a timer for a couple of seconds. During this time it'll show a saving message (maybe an icon later) along with a `Cancel` button. Hitting cancel stops the Task before it progresses to the save action.

<div class="video-wrapper">
    <video autoplay muted loop playsinline width="300">
    <source src="https://i.imgur.com/oP7BiI2.mp4" type="video/mp4">
    </video>
</video>

I think this improves the feel of adding reps.

### Timed exercises

This was a big one. I found it was less than ideal to have to leave the app to start a timer when recording timed exercises. To fix this, I built a timer function into the exercise record view.

<div style="max-width: 300px">{% image "./timer-min.png", "Timer view" %}</div>

This one was complex enough to require it's own ViewModel. I wanted to manage a few things - the accrued time both as a countdown until the target time was reached, and then counting upward, as well as a count-in of 5 seconds before the timer starts timing.

To do this I have two timers, with a reset option that you can call either by pressing reset or tapping the count-in while it's underway.

<div class="video-wrapper">
    <video autoplay muted loop playsinline width="300">
    <source src="https://i.imgur.com/I3nM0di.mp4" type="video/mp4">
    </video>
</video>

Once you stop the timer, it gives the option to then log the number of seconds recorded. You can also jump across to the manual view and record the number of seconds there if you prefer.

Lastly I added some sounds to indicate when the count-in was happening, when the timer starts, and when the target time is achieved. Of all the interactions, I think this is one that benefits from having some sounds as you might not be looking at the timer when doing a handstand, for example.

I grabbed some free sounds from [Kenney.nl](https://kenney.nl) and they seem ok for now.

It's good enough as a first version, but I see a few gaps I really need to tidy up to make it feel more complete.

## Current TODO list

I've since picked up a bunch more items for the TODO list. Some highlights that I hope to work on this week:

- UI fixes: Place the "Set 1 of 2" text closer to the reps number
- Add the `Saving...` flow for measured seconds
- Add plus and minus beside the log button to adjust the measured seconds
- Improve the animation between exercises (it's a bit choppy)
- ... and a bunch of small UI tweaks

Thanks for reading, and if you want to see my app as it is built, feel free to [download Reps on TestFlight](https://testflight.apple.com/join/Keq4Mca2).
