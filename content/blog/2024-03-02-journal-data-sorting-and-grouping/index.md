---
title: Journal Data Mocking, Sorting And Grouping
permalink: /journal-data-sorting-and-grouping/
description: Some first steps into displaying large sets of data in-app
date: 2024-03-02
tags:
  - dev
  - dev-diary
---

This week saw the beginning of a new view, the Journal view. This is where users will find their training history, and eventually some insights into their progress. A goal of this app is to help people know when it's time to progress to more challenging exercises, and I hope to use this view as a starting point.

Before I can start with that, I needed to simply list out the recorded data. The app was recording training sessions but not confirming to the user that they were stored, so that was the first goal.

## Creating mock data for previews

To work on the presentation of saved data, I needed some data to work with. [This article on using SwiftData with previews](https://www.hackingwithswift.com/quick-start/swiftdata/how-to-use-swiftdata-in-swiftui-previews) set out a useful approach using a `DataController` class, which could be passed in to my Journal view like:

```swift
#Preview {
    JournalView()
      .modelContainer(DataController.previewContainer)
}
```

First though I needed to generate some realistic-looking data. To do this I created a `JournalData` class that contains some methods such as `generateHistoryFromContext`. This method takes a desired number of weeks for which to generate a history, as well as some context (the user's weekly schedule and training level).

It then starts with the current date, and for each week, applies the weekly schedule to simulate recording the required exercises. To simulate progression, I also adjust the user's levels back every other week so that it looks like they are improving over time.

<div style="max-width: 300px">{% image "./exercise-journal-1-min.png", "An overview of exercises" %}</div>

## Grouping data

As you can see above, these are sorted by date and then grouped by month. To do this I used the [grouping property](https://www.hackingwithswift.com/example-code/language/how-to-group-arrays-using-dictionaries) in the `Dictionary` class:

```swift
let groupedByDay = Dictionary(grouping: journalEntries) { entry in
    return Calendar.current.startOfDay(for: entry.date)
}
```

This created a dictionary with the values being groups of exercises performed on each day. To sort these, I sorted them by day:

```swift
let sortedGroups = groupedByDay.keys.sorted(by: >)
```

To make dates easier to display for each entry, I then mapped the `sortedGroups` into a struct that allowed me to format the date:

```swift
struct GroupedJournalEntries: Identifiable {
    let id = UUID()
    let date: Date
    let entries: [ExerciseType: [JournalEntry]]

    var dateFormatted: String {
        let numberFormatter = NumberFormatter()
        numberFormatter.numberStyle = .ordinal

        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE"

        let day = Calendar.current.component(.day, from: date)
        let ordinalDay = numberFormatter.string(from: NSNumber(value: day)) ?? "\(day)"

        return "\(formatter.string(from: date)), \(ordinalDay)"
    }
}
```

This was applied in the above sorting/grouping step by returning `GroupedJournalEntries` for each sorted group entry:

```swift
return sortedGroups.map { date in
    let entries = groupedByDay[date]!
    let entriesByExerciseType = Dictionary(grouping: entries, by: { $0.exerciseType })
    return GroupedJournalEntries(date: date, entries: entriesByExerciseType)
}
```

### Grouping the groups

I then wanted another layer on top, grouping and sorting by month. This was the same but instead of starting with individual journal entries, I grouped the groupEntries based om the `year` and `month` date components:

```swift
let groupedByMonth = Dictionary(grouping: groupedEntries) { groupedEntry in
    let components = Calendar.current.dateComponents([.year, .month], from: groupedEntry.date)
    return Calendar.current.date(from: components)!
}

let sortedMonths = groupedByMonth.keys.sorted(by: >)
```

This gave me a dictionary of grouped months, each containing as a value a dictionary of grouped journal entries by day:

### Mock / testing data sorted

The end result was pretty good to get started. I'd like to do more to adjust it to have skipped days, variance in the reps numbers, and maybe model some over or under-performing users. That data will be useful later for calculating progression scores. However for now I can at least see how the basic data looks:

<div style="display: flex">
  {% image "./exercise-journal-2-min.png", "An overview of exercises" %}
  {% image "./exercise-journal-3-min.png", "An overview of exercises" %}
</div>

The above uses [DisclosureGroup](https://developer.apple.com/documentation/swiftui/disclosuregroup) views to contain each day, and Section views for each month.

## Keeping screen awake during timed exercises

A TestFlight tester found one subtle issue in which the screen would turn off when doing timed exercises, and the timer would pause. To work around this I used `UIApplication.shared.isIdleTimerDisabled` ([as described on Hacking with Swift](https://www.hackingwithswift.com/example-code/system/how-to-stop-the-screen-from-going-to-sleep)).

This was set to `true` when the timer starts, and `false` when the timer is stopped or paused.

## UserDefaults and iCloud

I found there's a useful class called [MKiCloudSync](https://github.com/MugunthKumar/MKiCloudSync). To use it I'd have to adjust my code to have some naming convention around the UserDefault values I'd like to sync with iCloud. Also, the code looks very old and isn't maintained, so I'm not entirely confident in it.

Having said that, the code is a simple wrapped around [NSUbiquitousKeyValueStore](https://developer.apple.com/documentation/foundation/nsubiquitouskeyvaluestore), so I could always write a little logic that checks if the local UserDefault values are empty and tries to load them from the store, while also backing up any changed values to the store as the app is used.

I've not managed to get this in place yet so will be pushing it to a future update.

## Current TODO list

Based on what I learned this week, I'd like to work on the following this week:

- Planning a "Progression indicator" value which could help inform people when it's time to progress to the next level
- Looking into a weekly "Done" state for each day, like in the app `Zero`
- Continue looking into adding iCloud backup for UserDefaults

Thanks for reading, and if you want to see my app as it is built, you can [try Reps for free]({{metadata.appLink}}).
