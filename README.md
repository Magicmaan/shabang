<p align="center">
    <a href="https://github.com/SeakMengs/WindowPet">
        <img src="https://user-images.githubusercontent.com/6903107/207167068-2196d2a3-2caa-4856-958b-a780fbda95c6.gif" width="500">
    </a><br />
    <img src="https://user-images.githubusercontent.com/6903107/207168016-85d0dd16-1f3b-4d42-9d37-0e0d5a596ead.png" width="400">
</p>

<p align="center">
A quick file search and app launcher for Windows, because I got tired of existing search.

</p>

<img src="https://user-images.githubusercontent.com/6903107/144858082-8b654daf-60fb-4ee6-89b2-6183b73510d1.png" width="100%">

<h4 align="center">
  <a href="#-features">Features</a> •
  <a href="#-hotkeys">Hotkeys</a> •
  <a href="#-todo-in-progress">TODO / In Progress</a>
</h4>

<img src="https://user-images.githubusercontent.com/6903107/144858082-8b654daf-60fb-4ee6-89b2-6183b73510d1.png" width="100%">

## 📖 Summary

Shabang is a file searching / help tool for Windows, built with Tauri.

## 🎁 Features + Planned

### Applications & Files

- Search for apps and files on system.
- Search environment variables.
- Uses Everything + Windows indexing.

### System Settings

- Access Control panel settings.

### Web Searches & URLs

- Supports opening URLs

### Bangs

- Support basic bangs
    > !c -> calculator
    > !f -> file
    > !s -> setting

> [Bangs are shortcuts that start with an exclamation point like, !calculator and !file](https://duckduckgo.com/bangs)

### Calculator

- Do quick mathematics from search bar

### Theme

- Light mode or Dark mode

## ⌨️ Hotkeys

| Hotkey                                       | Description                                   |
| -------------------------------------------- | --------------------------------------------- |
| <kbd>Win</kbd>+<kbd>Shift</kbd>+<kbd>R</kbd> | Open search window (default and configurable) |
| <kbd>Enter</kbd>                             | Execute                                       |
| <kbd>Ctrl</kbd>+<kbd>F</kbd>                 | Back to search                                |

## Planned Features

### Short Term

- Context menu
- direct website searching (youtube, twitter, etc) through bangs
- Custom bangs through localStorage / rust
- Volume control through search
    - quick volume for open apps
    - mute
    - apple music integration
- UI customisation
    - Position of UI
    - Blur background
    - click-through
    - search result format
- Widgets
    - Quick access widgets
    - Utility widgets (volume control, screenshot etc)
        - will be placed within search results at top
    - Arc bookmarks / workspaces
- Copy/Paste/Drop
    - Implement copy paste / clipboard
    - Show clipboard history
    - Drag / drop
- Settings
    - Basic setting stuff

### Long Term

- Open applications

    - View open applications
    - Force kill / restart applications
    - Volume control
    - Pin window open
    - Pin window to search (so open when searcher is open)

- PowerToys

    - Add widgets / tools from powertoys
    - Have dummy cheatsheet of keybinds
        > Can i just mention how great powertoys. Love that program

- Canvas / Draw system

    - Paste / keep images on search window
    - Keep notes in search window
    - pin image to desktop
    - Image text extraction

- Startup / initialisation
    - Give helpful tools / store apps which are just nice
        - Disabling cortana
        - disabling internet search on windows search
        - Windows 10 context menu regedit (I'm dreading moving to windows 11)
        - Windows 11 debloat tool
        - Better flyouts
    - All obviously optional and tucked away on purpose (I hate intrusion)
