# Release Notes

## Version 140.0.0: January 30th - February 9th, 2024
### Bug Fixes
- Rectified issue where personal room call duration was not displaying.
- Fixed intermittent profile suggestion failure during sign-up.
- Resolved occurrence where personal rooms would intermittently disappear from the dashboard.
- Addressed intermittent malfunction where the enter button ceased functioning during chat.
- Fixed loophole allowing users to send quick messages to blocked users.
- Improved handling of messages exceeding 2000 characters by introducing the "write & share" feature.
- Corrected splitting of words in received or sent messages on the chat panel.
- Terminated participant call when the owner of the personal room hung up.
- Restricted users from setting their days on calendar and appointment settings outside the selected date range.
- Ensured meeting descriptions maintain their format upon creation.
- Enabled viewing of chat history with blocked users.
- Corrected month name abbreviation on the calendar.
- Enhanced display of multi-line team descriptions on team detail pages.
- Fixed issue where newly written messages disappeared when multiple messages were sent immediately.
- Ensured call attendees panel appears on smaller resolutions.

### Improvements
- Strengthened password criteria for creating stronger passwords.
- Enhanced calendar slot rendering for improved performance.
- Introduced "connected" and "network" categories in global search for better organization.
- Removed block and report options from call history.

### New Features
- Added options to copy and forward messages in recent call chat history.

## Version 130.0.0: Date 02 - 12th January 2024
### Bug Fixes
- Resolved the issue preventing the download of uploaded resumes in account settings.
- Fixed the bug where entered email IDs couldn't be removed when sending invitations.
- Addressed the problem of uncontrolled playback of voice memos.
- Rectified the persistence of deleted pinned messages in the pin panel.
- Fixed the chat connection issue on Windows and Mac PCs.
- Addressed the non-functional "write & share" option.
- Resolved the simultaneous playback of multiple videos.
- Fixed the ability to send messages to anonymous users.
- Addressed the limitation on using certain special characters in topic descriptions.
- Resolved the non-functional feedback feature on Microsoft Edge browser.
- Fixed the issue with the multiple file send option.
- Resolved the inability to accept received invitations from emails.
- Fixed the navigation issue to the dashboard from mail-received links.
- Resolved the inability to view recent call history for topics with special characters in their names.

### Improvements
- Enhanced dark mode theme handling for better visibility across various areas.
- Improved message acknowledgment functionality for bulk unread messages.
- Reduced user listing load time on the admin panel.
- Improved execution time for profile updates in account settings.
- Enhanced tooltips data in several places for better user understanding.
- Improved UI rendering for better visibility.
- Improved global searching for team, topic, and group names.
- Enhanced translation for improved comprehension.

### New Features
- Added the option to copy any sent or received message during a call with a single click.
- Added the option to view incoming call notifications while the user is already on a different call.

## Version 120.0.0: Date - 24 November - 22 December 2023
**Bug Fixes**
- Fixed an issue where the Enter button would sometimes not work.
- Resolved the occurrence of the same date appearing multiple times in the chat panel.
- Addressed a bug where the checkbox was not disappearing after moving from the contact panel to the recent panel.
- Corrected the display of call attendees' information, which was previously incorrect.
- Improved the system's responsiveness when uploading/sending large files.
- Fixed the malfunction of the Retry and Cancel options during file upload processes.
- Rectified the distortion of the Global Search UI when no data was present.
- Fixed the issue where enabling translation was not working in certain cases.
- Users can now successfully update their calendar settings.

**Improvements**
- Enhanced Portuguese translation for better comprehension.
- Reduced data loading time for the recent panel and message loading.
- Improved contact filtering under location, title, and department tabs in the contact panel.
- Enhanced data validation in various areas to improve security.
- Improved tooltips data in several places for better user understanding.
- Streamlined data searching for the designation field during sign-up.
- Improved calendar settings and appointment setting functionality for better user control.
- Enhanced dark mode theme handling in various areas for improved visibility.
- Improved UI rendering in several places for better visibility.

**New Features**
- Added a "More" option in the menu for users to share feedback, switch to dark mode, and access help from the Melpapp guide.
- Introduced the option to upload and download documents, PDFs, and other formats on the whiteboard for co-annotation during calls.
- Added several new video backgrounds on the call screen.
- Included a moderator option on the call screen to mute audio/video for everyone, restricting users from making changes.
- Introduced a download option for images and videos in the file manager.
- Added coworker and network tags in the recent message panel.
- Introduced the option to copy a message with a single click.

## Version 119.0.0: Date - 23 October - 23 November 2023

**Bug Fixes**
- Resolved the issue where recent meeting values were not displayed accurately.
- Fixed the malfunctioning search functionality in the forward popup, ensuring a seamless experience when searching for specific items.
- Sorted notification data for particular meetings, preventing disorganized information.
- Global search now accurately renders message information.
- Addressed the issue where, during message forwarding, previously selected contacts were auto-shared if the forwarding process was canceled and retried.
- Fixed the absence of on-call chat history in the recent panel for meeting calls.
- Scheduled meetings now correctly appear in the left panel of the calendar for specific days.
- Users can now copy links shared in messages without any issues.
- Improved the ease of placing emojis in between entered text.
- Resolved the situation where the meeting details pop-up did not hide when clicking outside the popup box.
- Fixed the bug where the emoji panel did not hide after clicking outside of it.
- The recently added panel now displays records even after filtering blocked contacts.
- Meeting notification panel now opens correctly upon clicking the button.
- Message acknowledgment on replied message cells no longer remains in a waiting state.
- Users can now send messages even after the system or tab remains idle for an extended period.

**Improvements**
- Updated tooltip label values in multiple locations for enhanced clarity.
- Improved the logic for establishing chat connections, reducing delays in reflecting changes.
- Enhanced UI rendering in various areas for improved visibility.
- Optimized calendar module logic for better performance and information rendering, resulting in faster execution.
- Optimized user profile listing and updating logic for improved performance, data handling, and information rendering.
- Enhanced the dark mode theme handling in various areas for improved visibility.
- Significantly improved the overall functionality of the admin panel, leading to better performance, faster data rendering, and quicker execution, resolving several other minor issues.
- Streamlined the functionality of file sharing, resulting in faster upload times and reduced download times.

**New Features**
- Added the option to view user profiles, meeting details, and team/group information directly from the recent call history panel.
- Introduced a feature to enter email IDs separated by commas without the need to click the add button when scheduling a meeting.
- Added an option to display `network` and `co-worker` tags on the recent message panel.
- Users can now view the privacy policy of MelpApp by clicking the learn more button in the gif panel.

## Version 118.0.0: Date - 11 September - 17 October 2023
**Bug Fixes**
- Updated the sample file for bulk invite functionality.
- Fixed an issue where content didn't appear after downloading a document in MS Word using the Write and Share feature.
- Resolved the issue of redirects on business or individual pages.
- Fixed the problem with joining group calls.
- Addressed the issue where group calls would get disconnected if any user hung up.
- Implemented the feature to send a declined call message personally to the initiator.
- Resolved the problem where, after accepting a call, the "user busy on another call" status stopped working if the user refreshed the parent app.
- Added a check for text availability before copying and linking.
- Fixed occurrences where recent call history appeared in the middle panel of contacts.
- Ensured that the "Read More" option consistently appears for forwarded text.
- Fixed an issue where connection sorting was not working properly in reverse order (from Z to A).
- Prevented multiple calls from initiating for the same person/group/topic if clicked frequently.
- Resolved the problem of duplicate call notifications from the same user appearing on the receiver's end.
- Ensured that if a user receives the same call notification on multiple tabs and acknowledges it on one tab, the notification pop-up hides on the other tabs.
- Fixed an issue where notification read status was not updating.
- Displayed the "you are blocked" information message on the other end after the block action was taken.
- Resolved unresponsiveness when searching for users in the Calendar's `Add Invitees Section`, along with the issue of the dropdown not hiding when the input field was blank.
- Fixed an issue where a recently made API call was triggered when scrolling within a different module after returning from the recent call.
- Added an empty state when there's no data available in the API for the recent call section.
- Ensured that the blocked message no longer appears in the recent call chat if the blocked user's chat is opened first.
- Fixed an issue where on hover, delete icon remained visible even after deleting the message.
- Resolved the network invitation count issue.
- Addressed the problem on Safari where the parent window lost connection with its open call child window, leading to memory clearing and notification issues.
- Fixed the issue where users were sometimes unable to log out from Melpapp on Safari.
- Added additional pop-up blocked validation for Safari browser to handle call window opening conditions.
- Resolved the issue where user receives multiple call notifications but, after accepting one call, the rest of the call notifications do not disappear, and the user's busy status is not sent to the initiator.
- Fixed the issue where sometimes the profile picture on recent calls does not appear or breaks.
- Corrected cursor placement on the call chat panel.
- Ensured that recently created groups/topics/teams appear in the middle panel, even if the user visits our open application immediately after waking from sleep mode.
- Fixed the issue where the cursor pointer was missing when editing fields in the account settings.
- Fixed the issue where users were unable to switch to the "Recently Added" filter in the "My Invitations" section within the Network Module.
- Added missing Notification, Pinned Item, and Message Tray Icons to Coach marks as part of the New User Onboarding experience.
- Shared XML file, appears as video in preview panel has been resolved.
- Wrong profile picture appearing in On-call chat history panel has been resolved.
- Corrupted audio files download problem has been resolved. 
- The issue with the contact and network modules where the counts were displaying as blank after opening the chat has been resolved. 
- The link issue in the chat, where links were repeating, has been resolved. 
- The the organizer's name missing in the eMeeting has been resolved. 
- Resolved the issue where multiple invitation notification of personal room does not disappear after clicking on `Go to Room` CTA.
- Resolved the issue where broken image was appearing in replied message cell.
- In the calendar year view, when selecting a specific month, all the month names in the view were changed to the selected month.
- In the recent call history, the empty state overlapped with the data.
- Resolve the problem where empty state overlapped with the recent call history records.
- Resolved the problem where user was not able to forward and received replied message.
- On Call chat- input panel should be get focused automatically.
- Resolved the problem where year view remained unaffected, event after changing the year.
- Resolved the issue which is expiring the user's session if user join's the meeting call through mail link.
- Resolved the issue where pause icon doesn't change once the audio stops playing in filemanager.
- Resolved the issue where played video sound keep coming, even after closing the preview pop-up.
- Resolved the issue where on-call received message appearing as `deleted` in call histroy log.
- Resolved the issue where GIF `terms & policy` pop-up UI getting distoryed.
- Resolved the issue where recent call log file tab showing other call records too.
- Addressed the issue where forwarded message format get distorted.
- Fixed the issue where shared link's complete information are not appearing on chat screen.
- Resolved the issue where empty state was not coming under file tab of recent calls.

**Improvements**
- Optimized the logic for the user's last seen status, reducing the delay in reflecting changes.
- Improved the rendering of user profiles.
- Enhanced the dark mode notification system for both read and unread messages.
- Improved the placement of loaders while uploading files on the chat panel.
- Enhanced the logic for oneDrive integration to handle failure cases and data rendering.
- Improved the visibility and size of the quick message container.
- Adjusted the placement of user tags in the recent meeting panel for better visibility on higher resolution screens.
- Updated label values in several places for better understanding.
- Updated Spanish and Portuguese translation labels in several places for improved comprehension.
- Updated failure case messages in various locations for clearer reasoning and clarity.
- Improved the rendering of the join button in the middle panel of the calendar and linked it with live conferences.
- Enhanced UI rendering in several places for better visibility.
- Improved the rendering of empty states on the notification panel.
- Improved the logic for establishing the chat connection, reducing the delay in reflecting changes.
- Improved label and icon alingment in several places for better clarity.
- Prevented the application from submitting the same detail more then once in single click.
- Improved in-call chat characters alignment for better visibility.

**New Features**
- Added the ability to view further information, including metadata, for any shared link in chat.
- Introduced call type tags in recent call history.
- Introduced a new feature that allows users to play audio files directly by clicking on the file name within the audio tab of the file manager.
- Added a panel to guide user to update their browser setting or disable adblocker for smooth interaction.

## Version 117.0.0: Date - 01 - 09 September 2023
**Bug Fixes**
- Fixed the issue where users were unable to update group names and descriptions.
- Resolved the problem of instantly created groups not appearing in the group panel without a page refresh.
- Fixed the issue on the admin panel where the filter panel did not close after applying a filter on teams.
- Corrected the page count display on the admin panel.
- The logged-in user name now appears correctly on the admin panel even after page refresh.
- Enabled users to update team and topic information, addressing the disabled update panel issue.
- Users can now easily skip the suggestion page after completing signup.
- Fixed translation issues on the login page.
- Improved image zoom in/out functionality for better visibility.
- Altered the placement of the loader on file uploading cells.
- After accepting an invitation, the user's status now correctly changes on their profile card.
- Users can now join calls from received email links.
- The team's image now correctly reflects in the chat panel after sending a message in a newly created topic from the team page.
- Fixed the issue where the dropdown for notifications in meeting details was not working.
- Voice memos now appear correctly in the receiver's chat panel.
- Users can now select and copy the description of a created meeting.
- Fixed the validation issue for skill selection.
- File previews now work properly.
- Updated the connection sorting algorithm.
- Sent voice memos no longer appear as videos in the middle panel.
- Resolved the issue where an alert message, 'You are already on a call,' appeared if the call screen was closed and the user immediately tried to join the call.
- After receiving a call notification popup, joining the call from recent calls or live calls now correctly closes the notification.
- Sample CSV files for bulk invites are now available.
- Quick message panel's container size was getting distorted.
- ByPass self add to call notification.

**Improvements**

- Optimized the 'screen awake lock' logic for better memory and battery consumption during calls.
- Added character counters across all input areas of the chat for a better user experience.
- Improved the flow of accepting invitations from notifications or the global search panel, now directly opening the chat panel.
- Enhanced the size and visibility of the OneDrive pop-up.
- Shortkeys now work on the profile creation page for selecting dropdown values.
- Improved label, character casing, and font size for the team, group, and topic panels for better visibility.
- Enhanced Portuguese translation throughout the web app.
- Added the user's time zone on the meeting detail page for better understanding.
- Improved icon placement in various areas for better visibility and click handling.
- Improved notification panel color situration in dark mode for better visibility.
- Changed label after switching the dark mode to light mode or light mode to dark mode.

## Version 116.0.0: Date - 26 - 31 August 2023
**Bug Fixes**
- Addressed an issue where users were unable to preview images from the file tab in the chat panel.
- Enhanced label text and micro copy across various interfaces to improve comprehension.
- Resolved a problem where the breadcrumb title was malfunctioning in specific scenarios.
- Fixed a situation where, after accepting a call and during the process of joining the call, the user's call would get disconnected if any other participant hung up.
- Rectified a situation where attempting to delete an account after scheduling a meeting would result in the delete account confirmation popup displaying meeting information.
- Eliminated an unnecessary message stating "you are already on call" that some users were receiving after accepting a meeting call request.
- Restored the ability for certain users to access their personal rooms.

**Improvements**
- Upgraded the user interface of tooltips to enhance visibility.
- Changed the label from 'participant list' to 'total attendees' for clearer understanding.
- Enhanced notification text for notifications related to personal room activities, improving clarity.
- Updated menu icons to improve visibility.
- Implemented a feature that terminates all existing sessions for a user after resetting their password, enhancing security.
- Optimized the logic for rendering profile cards, resulting in faster loading and improved visibility.
- Optimized the recent call attendees logic.

**New Features**
- Introduced the option for OneDrive integration in the in-call chat.
- Integrated the 'screen wake lock' feature upon joining a call to enhance the call experience.
- Incorporated meeting reminder notifications.
- Added functionality for managing Teams and groups in the admin panel.
- Expanded the user module of the admin panel with multiple filtering options, record exporting, detailed views, admin visibility, password resetting, profile editing, and other features.
- Included an option for handling domains and sub-domains.


## Version 115.0.0: Date - 15 - 25 August 2023

**Bug Fixes**
- Resolved an issue where the loader was not appearing while fetching additional records on recent calls.
- Fixed a bug causing shared text files to appear as videos in the chat panel.
- Addressed the problem where the "Create Team" button appeared disabled when it shouldn't.
- Centered the loader properly on the GIF panel.
- Closed the emoji or GIF panel automatically after clicking outside of it, following its opening.
- Fixed the bug where acknowledgment did not appear after deleting a message.
- Rectified the cases where the "Write & Share" panel was not displaying.
- Corrected the improper functioning of contact search in the contact and network panels.
- Fixed the issue in the group panel where the sender's name was displayed as 'You' instead.
- Resolved the problem causing group calls to disconnect and windows to close automatically after user acceptance or joining.
- Addressed the scenario where joining an ongoing call in the background did not bring it into focus.

**Improvements**
- Introduced the ability to directly paste copied OTP into the input area.
- Enhanced the placement of icons in the on-call chat panel for improved accessibility.
- Optimized the encryption and decryption logic for faster performance.
- Reduced chat history loading time, resulting in quicker rendering.
- Improved the logic for jumping to specific messages from the global search, notifications, or message panel.
- Added message date and time in the message cell of global search.
- Provided an option in calendar settings to set availability in a 12-hour time format.
- Refined the UI of the language selection panel for better visibility.
- Enhanced the user interface after translating the web application into Portuguese.
- Updated various user interface elements to improve visibility and accessibility, including the admin panel, file upload section, and middle panel.

**New Features**
- Added a tab in focus check to reinitiate pending processes.
- Provided the option to view created meeting details immediately after scheduling a meeting.
- Integrated Application Performance Monitoring (APM) for performance monitoring purposes.
- Introduced the ability to load more files under the files tab in the chat panel.


## Version 114.0.0: Date - 7 - 14 August 2023
**Bug Fixes**
- Resolved the issue where users couldn't fetch complete call history while scrolling. Implemented a solution to display more call history as users scroll.
- Fixed the bug causing the join button to disappear unexpectedly from the middle panel.
- Rectified the "Create meeting" feature, which wasn't closing automatically after users received the success message "Meeting created successfully" upon scheduling a meeting from the dashboard.
- Addressed the problem of the join button vanishing from the calendar meeting details page once the meeting concluded.
- Fixed the occurrence of the 'Allow notification permission pop-up' even after users had already granted permission.
- Enhanced labels and CTA texts in various areas to improve understanding and clarity.
- Resolved the issue where the attendees panel wouldn't close when users opened another panel.
- Fixed the bug causing the first-time click on the email verification template to open the expired page.
- Rectified the failure to load the team's thumbnail on the chat panel.

**Improvment**
- Upgraded the logic for initiating, handling, and managing calls to enhance response time and synchronization.
- Expanded support for additional file types.
- Provided an option to view created meeting information once a meeting is scheduled.
- Enhanced the user interface in multiple areas such as sub-calendar, signup, and calendar to improve visibility and accessibility.
- Reduced the time window for displaying the join option for scheduled meetings from 10 minutes to 5 minutes.
- Addressed the delay in displaying call screens on the screen.

**New Features**
- Added the capability to display the list of on-call attendees to the recent call chat history.

## Version 113.0.0: Date - 28 July - 4 August 2023
**Bug Fixes**
- Corrected an issue in the Middle Panel where the wrong sender's name was being displayed.
- Fixed a problem in the chat panel where the topic's display picture was failing to load in certain cases.
- Resolved the problem where clicking on the email verification template for the first time was leading to the expired page.
- Implemented additional restrictions on file uploads to enhance security and privacy.
- Rectified the unwanted scrolling behavior in the Attendees panel.
- Addressed the issue where the call join button would remain visible in the team middle panel even after the call was over.
- Fixed the non-functional resume upload feature in the account settings.
- Restored the functionality to view user profiles on the admin panel.
- Corrected the non-operational graph display feature on the admin panel.
- Enhanced the upload file user interface to improve accessibility.
- Improved the visibility and accessibility of the join button's user interface.
- Resolved the problem where the attachment popup would not close upon switching chat screens.
- Fixed the rendering of coach marks and tour guides on screens.
- Prevented the removal of selected contacts from the location filter when users switch tabs.

**Improvment**
- Updated the user interface in multiple areas to enhance visibility and accessibility.
- Enhanced the user interface in various sections to support higher resolutions and improve visibility and accessibility.
- Optimized the logic for generating notifications to improve processing and notification listening.

## Version 112.0.0: Date - 24 - 28 July 2023
**Bug Fixes**
- An unclear Confirmation message is displayed while sending any attachment to any contact
- The user is able to send files to blocked users
- An incorrect alert message appears when attempting to exit any group
- Received spelling is wrong in the "Received" section and the filter option. Additionally, the "People you may know" section is missing an empty state or text.

**Improvment**
- Updated the UI in several places for better visibility and accessibility.

## Version 112.0.0: Date - 6 - 21 July 2023
**Bug Fixes**
- On Reset password, button was not getting enable.
- On reset password, password pattern check was not working properly.
- After taking the team tour, user was not able to create team, because create team button was appearing disabled.
- Instead of group, team text was coming on create group pop-up.
- On dashboard - Tooltip was not coming on some areas.
- Home button of 404page is not working - Resolved.
- After moving to create account page, user was not able to go to previous page. - Resolved
- On safari & edge two eye icons was appearing on password field - Resolved
- Middle panel showing self name some times instead of sender name. Resolved
- Uploaded text file was coming as video.
- Removed replied cell and see translation text for deleted messages.
- See translation button does not works some times.
- In some cases - file download was not working.
- If notification panel does not have any records, then loadeer does not disppearing even after throwing the empty state.
- We have addressed the issue on tablet devices where the footer strip, specifically the call screen, was not easily accessible. With this update, we have repositioned the footer strip and made adjustments to its size and placement
- Resolved several other minor issues.

**Improvment**
- we have optimized the FCM token generation logic. Additionally, we have introduced an expiration policy for the tokens and implemented an auto-generation concept. These enhancements aim to improve the overall efficiency and security of the application's messaging & calling system.
- Long text messages taking time to translate the message.
- Updated the UI in several places for better visibility and accessibility.
- We have improved the icons on the notifications panel to enhance clarity and make them easier to distinguish.
- We have made significant improvements to the dark mode color and saturation specifically for the global search panel
- Updated the UI of coach marks for better visibility and accessibility.

**New Features**

## Version 111.0.2: Date - 1 - 05 July 2023
**Bug Fixes**
- On the login screen, the default error message was appearing even though the user logged in successfully.
- The Service Offer section is throwing an error, even though values have already been provided.
- The Expertise dropdown was not opening.
- Delete message api keep getting triggered, after receiving the delete notification, which is causing the application to get freeze.

**Improvment**
- Implemented the necessary logic changes to accommodate the backend's short URL implementation for both personal room and calendar links.


## Version 111.0.1: Date - 24 - 30 June 2023
**Bug Fixes**
- Deleted recurring meeting still appear in calendar's middle panel.
- Updated resume heading in account setting for better understanding.
- Once any message get deleted it should be automatically get removed from all recipient end.
- Call Notification pop-up does not get disappear after 45 seconds.

## Version 111.0.0: Date - 15 - 23 June 2023
**Bug Fixes**
- Fixed an issue where the `Skip Tour` option was missing from the contact tour.
- Resolved the problem on the Team & Group page where the next tour started automatically after skipping the tour.
- Fixed the issue on the Team & Group page where two create pop-ups appeared one over the other when clicking on the Create Team & Group button.
- Resolved the problem on the Invitation page where the next tour started automatically after skipping the tour.
- Fixed an issue where, in some corner cases, the call screen did not close even though the user hung up the call. It kept reopening repeatedly.
- Fixed the problem where the user was unable to delete any message that contained emojis.
- Resolved the issue in the recent middle panel where the text You was displayed instead of the sender's name.
- Fixed the problem where the user was unable to unblock any of their blocked users.
- Resolved the issue where the user was unable to create a meeting by clicking the Create Meeting button on the dashboard.
- Fixed the problem where the user was unable to download another user's resume from the profile card.
- Resolved the issue where the user was unable to attach any documents while booking an appointment.

**Improvements**
- Added an arrow icon on the profile, recent, and network menus for better understanding.
- Provided the option to provide a custom name while creating a post.
- Updated the UI in several places for better visibility and accessibility.
- Improved the performance and stability of the `Book An Appointment` feature and reduced the response time.

**New Features**
- Added the option to view all Call and non-In-Call participants on the Personal Room.
- Introduced the feature to translate the entire application into `Spanish` language. Users can enable this feature from the `account settings -> Work -> Language Tab`.
- Introduced the feature to translate the entire application into `Portuguese` language. Users can enable this feature from the `account settings -> Work -> Language Tab`.
- Added the feature of `Calendar Settings` which allows users to customize their available time, meeting duration, and available days for any scheduled meeting.
- Added the feature of `Appointment customization`, which allows users to create a separate appointment link based on their availability and share it with any person. Users no longer need to share all their available slots. To use this feature, go to `Calendar -> Events -> Create Event`.

## Version 110.0.2: Date - 12 - 14 June 2023
**Bug Fixes**
- When the call automatically gets hanged up, then the system is not sending the 486 packets and is not able to clear the call information.
- Mutliple call notification was not working.
- The toggle button design has been modified in both the account setting popup and the translation popup.
- Changed empty state image of archived, recieved and sent section
- Adjust cross icon of account setting, notification alert popup
- You text was appearing in middle panel instead of Sender's name.
- Some-times callinformations variable does not get cleared, which was causing memory leak issue. And user is not able to close/hangup his/her call screen.

**Improvements**
-  Regenerate the FCM token for smooth calling, once it gets expired automatically.

**New Features**
- Added option to view all call and not in-call participants.
- Added option to show meeting's waiting participants in attendees panel.
- Added input for enter file name in write & share post popup, as well as a note message for the user.


## Version 110.0.1: Date - 22 May - 9 June 2023
**Bug Fixes**
- Once the user receives a silent block notification, disable access to send messages, initiate calls, schedule meetings, etc.
- Fixed Sub-calendar UI issues.
- Not able to open the creat meeting pop-up - resolved.
- Resolved the problems related to the size of the group icon.
- On account setting, the wrong country flag was coming.
- The user was not able to start the instant call after selecting the participants.
- After selecting the participant from the left panel, switch to the location tab, then the network tab after that switching to all contact is not possible
- Report option is only coming for Network user, instead of all users - Resolved
- On Notification Panel's content was not clearly visible on dark mode.
- After enabling the dark mode, Input and audio cell was not clearly visible.
- Old Messages are appearing in today's date.
- System is not able to handle the last date of last month's message.

**Improvements**
- Updated Join button design in the middle panel for better visibility
- Improve web app loading experience on all Screens/Modules.
- Upgraded chatCandy Version to v-2.2.0 release 3.
- Divided call module logic into further micro-events for better usability, readability, and reducing unwanted method calling.
- Improved logic for sending/receiving call packets to the server.
- Improved logic of calling active conference API, to reduce the number of trigger events which eventually improves the activation/deactivation 
    of the `LIVE CALL` button.
- Single emojis have been increased in size for improved visibility and enhanced visual experience.
- Relaced 'Email Chat' text with 'Email Your chat' in chat's more option.
- Relaced 'Post' text to 'Write & Share' text in chat's more option panel.
- Upgraded Conference Server.
- Upgraded MelpPad and White-Boarding features.
- Fixed Ask to unmute functionality.
- Added option to show Call participant list.
- Added functionality to show reactions on call.
- Reduced internet data consumption.

**New Features**
- Integrated logic send and receive custom notification on call to all or selected participants. (This feature will be used in the future).
- Added scroll bar in select slot option of Sub-calendar events.
- Added max limit (3) in adding time slots while creating sub-calendar events.
- Introduced third-party DRIVE integration (Google Drive, OneDrive) on the chat panel and file-Manager, using which users can directly send their Google/One drive files to any user or team. And they can also see their all drive files in their File Manager, after successfull authentication.


## Version 108.0.7 : Date - 5 - 19 May 2023
**Bug Fixes**
- Onboarding tour was not appeating properly.
- Empty state was not coming on file manager.
- Resolved location rendering issue on signup screen.
- When user double click on recent menu- it direct to call screen only.
- User is not able to receive his/her first message from any user.

**Improvements**
- Implement new design of Notification panel.
- Appliation left panel data redebring improved.
- Improved Dark mode color saturation.
- Displayed default message for safari user to switch to any other browser, for better performance.
- When user block any other user, then after openning his/her chat, then showed option to unblock on same chat screen.
- Changed API calling on link tab under chat panel.
- For personal room request to join call, removed timer to remove that notification.

**New Features**
- Add icons for the post, email etc features in the more options section of the chat.
- Displayed user's current location by default on signup screen.

## Version 108.0.6 : Date - 28 April - 4 May 2023
**Bug Fixes**
- Message received/Group create date is not coming in group middle panel.
- After performing auth login/signup, user first redirected to login and then shifted to dashboard.
- ISD code is not appearing for the user, who haven't update their phone number.
- When manually entering the location and attempting to proceed with the profile, a location popup suggestion appears in between an alert.
- Once the time duration of mute notification is over, mute icon should move to deactivate state.
- Clicking on any button in the incall chat only enters the emoji and does not perform its assigned functionality
- Newly registered user is not able to receive his/her first message.
- Any existing user is not able to receive first message of his/her new connection.

**Improvements**
- After refreshing the page, the profile picture is not getting updated, although the thumbnail is displaying the updated image.
- Add total participant count on Contact and connection tab (Middle Panel) beside title
- Synchronized the loader on all authentication screen.
- Improved the CountryCode api calling. Now it will be called once and stores the information in local cache.
- Reduced `detectLanguage` Api calling for the messages which only contain numbers, special characters or emojis.
- If message received in different language, then instead of asking to enable translation, directly giving see translation button.
- Disabled console panel for Imeeting, Emeeting and appointment panel.
- Optimize message controller implementation for better performance.

**New Features**
- Show 'message is deleted' text on chat.


## Version 108.0.5 : Date - 21 - 27 April 2023
**Bug Fixes**
- Sign in/up using office 365 keep throwing user on login screen - Fixed
- On canceling the sent request- cell does not disappear.
- Resolved below responsive issues Admin Panel Issues:
    -DashBoard Screen.
    -All Users Listing Screen.
    -Inactive Users Screen.
    -Deleted Users Screen.
    -Add User Screen.
- Resolved below responsove issue:
    - Signup Module:-
        - In signup page eye icons are very big.
        - Remember me and forget password text is merging.
        - Or continue with separator lines are not aligned properly.
    - All Contact :
        - Select all user icon is big.
    - Add to team :
        - Search icon is very big.
        - Buttons are not equal.
    - Create meeting :
        - Cancle and Save Buttons dont have same size.
    - Create Team :
        - Deleet icon is very big.
        - Too much letter spacing.
        - In edit team: These delete icon and admin icon is very big. 
        - Back button is not correct.
    - Shared with: selected option is coming with a redline on right.
    - Pinned icon are coming very big.
    - Setting popup is having issue with alignment and icon.
    - Waiting icons are not showing properly.
    - Profile card Icons are too big
    - Meeting Over Popup
    - Network Module
        - Social Media icons are not aligned and have UI issues.
        - Contact directory have highlight underline which is over exceeding.
        - Invite button is cutting.
    - Upload Contact Popup
        - Upload button is not as per our melp standards.
        - Upload details fonts is looking big.
    - FileManager
        - Select icon is not center aligned.
        - Select number is not aligned.
        - share button is not correct.
        - icons are not aligned and are bigger in size.
    - Updated co-workers and network tags for better visibility. 
    - After selecting the avatar (selected avatar size is not in perfect shape.
    - If we select any user then it’s not showing selected in the list.
    - Avatar with email Id, the Initials written on the avatar are not centre aligned.
    - After adding to call the Ok button of popup is not aligned.

**Improvements**
- Added additional check of accesstoken of call, if not received then do not start the call.
- Optimize dark mode.
- Reduce js and css file complie time, for better process.
- Optimize the group records sorting and rendering time.
- Improved the middle panel record rendering time.


## Version 108.0.2 : Date - 14 - 20 April 2023
**Bug Fixes**
- Block and unblock list throwing error - Resolved.
- Dark mode cells are coming on some pages - Resolved
- Canada flag was appearing for some US users - Resolved
- Darkmode issue from doc file
- On darkmoe network unavailable popup is not coming.
- Undefined text was appearing in some case under calendar link and room link section.
- A new URL keeps triggering which contain undefined text at the end.
- Drag and drop feature also considering text as draggable item.
- Gif api automatically triggered several times.

**Improvements**
- Changed font weight entire application for better visibility.
- Added sample CSV file for bulk invitation.
- Chat module: Profile Card: To access the profile, click on the profile picture on the chat screen, and it will profile card and team/group details.
- Remove Info icon from chat panel.
- Moved 'live calls' at the first place in top header icons.
- Icon quality and Responsiveness improved for :-
    - Dashboard module
    - Recent calls middle panel
    - Calendar module
    - FileManger
    - Changed Chat Icons
- Font Weight improved for better visibility on `account setting`.
- Improved dark mode feature for more visibility.

**New Features**
- Added Block list under contact page to view all the blocked connections.
- Added unblock option on user list to unblock - blocked connection.
- On Contact Directory page added `select all` option to send invitation to all user.
- Added Character limit on report pop-up, so that user can get the idea, how long text can be enter there.
- Added email option in profile card for coworkers.


## Version 108.0.1 : Date - 7 - 13 April 2023

**Bug Fixes**
- Team Arrow images change
- Reduce the size of arrow icon under team and location tabs of middle panel.
- Email chat date popup issue is fixed.
- Account setting model giving several warnings in conolse whenever it open.
- The empty states for the file manager are not appearing when a new user creates an account on Melp.
- Enter issue for the first time in the input area of chat.
- Hide/share post popup on click.
- Change Location Label value.
- "You" is displayed in the middle panel for a message sent by someone else.
- The attachment icon of a replied message overlaps with the name of the attachment when replying to any attachment in the chat.
- When we enter any mail ID, that same mail ID is not showing as selected on the right side. The Add User button was not working on smaller resolutions.
- Getting an error at the time of uploading a profile on Create a team.
- On lower resolutions, the image preview is not working properly.
- Team/Group DP changes throwing errors; fixed.
- Network and Invite People Remove the border around the "Upload" text that appears on the bulk guest invite popup.
- he feedback popup is not as per design; the circle overlaps the text on the popup.
- Dashboard module: Network: The color of the text in the contacts directory's empty state and the text indicating "no search results found" on the Invite People section are incorrect.

**Improvements**
- Disable right click event on entire application.
- change the label of the verified phone number message, bulk invite, and active calls
- Chat connection issues for long idle states have been resolved.
- Optimise chat connection logic as it is triggering the request to connect too frequently.
- Changed Dark Mode default color.
- Need to synchronize all tags across all screens.
- The download icon is not aligned on the attachments, and need to apply the character limit on the report and block description.
- Chat module: Profile Card: To access the profile, click on the profile picture on the chat screen, and it will profile card and team/group details.
- Remove Info icon from chat panel.

**New Features**
- Added feature of creating a duplicate sub-calendars event link.
- Added a waiting state to send messages
- Implement `block and report` functionality for user and messafes.


## Version 108.0.0 : Date - 31 March–6 April 2023

**Bug Fixes**
- The user interface of the Join button appears distorted when viewed on lower screen resolutions.
- Post message popup and email chat popup design issue fixed.
- When the user selects, the option to hide recently added items is hidden.
- email chat pop-up issues.
- Logout from all devices is not working properly as the user is not redirected to the login page.
- Working on image preview issues.
- 'Not mentioned' text is not coming in user cells.
- When we switch the filter to the Send, Receive, and Archive section and move to the Recently Added section, the selected members from the right side disappear automatically.
- When we enable a language for translation in the chat, the language-enabled text is cut off from the chat screen.

**Improvements**
- If we update a team's profile picture and have the chat window for messages, topics, or groups open on the right side, the newly updated profile picture must be displayed on the - header of the chat window.
- The account settings pop-up window displays several warnings in the console.
- Highlight the date position and leave the left panel empty.
- When receiving an invitation, it is useful to know when it was sent. To provide this information to the recipient, the invitation should display the received date.
- changed version variable placement; changed bulk invite API.
- Modify the delete account popup and the password verification code.
- Implement the updated user profile card design to show all of the information in a single fold.

**New Features**
- Implement the user feedback design on the web application.
- Implement the admin panel, dashboard, domain verification, domain selection, and user listing design.


## Version 107.0.8 : Date - 24 – 30 March 2023

**Bug Fixes**
- Change in media access control in Imeeting
- Even after granting permission for the camera and microphone, the personal room lobby screen still shows the allow permission message.
- Handle global search empty state
- The chat/add-to-call/waiting participant panel does not open in full-screen mode.
- Sorting issue after selection and changing the icon of the checkbox
- The width of the gif popup is incorrect; change the position of the gif popup.
- Header of the chat window is not aligned properly.
- Logout from all devices is not working properly as the user is not redirected to the login page.
- Email chat popup UI issues are resolved.
- On the email chat popup, the selected user's initials are coming up wrong. - Fixed
- When the user selects, the option to hide recently added items is hidden.
- post message popup, email chat popup issue in dark mode - resolved
- Highlight the date position and leave the left panel empty.
- When we switch the filter to the Send, Receive, and Archive section and move to the Recently Added section, the selected members from the right side disappear automatically.

**Improvements**
- In-call chat: focus on uploading cell.
- If we update a team's profile picture and have the chat window for messages, topics, or groups open on the right side, the newly updated profile picture will also be displayed on the 
- When receiving an invitation, it is useful to know when it was sent. To provide this information to the recipient, the invitation should display the received date. change the heading of the display data

**New Features**
- Implementation of user feedback functionality.
- Full pricing and pricing design flow will be on the website.
- Completed feedback feature functionality and user interface.


## Version 107.0.7 : Date - 17 - 23 March 2023

**Bug Fixes**
- Sign Up: When we fill out all of the mandatory fields on the signup form, the Get Started button is not always activated.
- When we select the business or individual tab and then click on the back button, the back button is not working.
- The submit button is not activated after entering a new password and confirming the password.
- When we select the business or individual tab and then click on the back button, the back button is not working.
- The UI for the "Resend Verification Email" and "Back" buttons becomes distorted when attempting to open the verification email link or reset the password a second time.
- The "no repetitive number" password condition is already satisfied without entering any number in the password text field.
- Tour coach marks are not appearing on the page switch.
- The "no repetitive number" password condition is already satisfied without entering any number in the password text field
- On the invitation page, Coachmarks was not working properly. After completing or skipping the tour, it still appeared. The Contact Directory dropdown needs to be aligned with
    the invitation page tour; it should not be a separate entity.
- worked on issues with one-to-one call reply messages
- topic load issue on the first time
- Fixed UI issues on the signup flow
- On the Recent Call page, the Join button appears on the wrong participant cell.
- skip and go to the dashboard button changes
- Chat Module: While replying to any message, the typed text message overlaps with the reply message cell.
- displays a blank message if the user was already invited when they signed up.
- In the signup flow, the label is fixed on the filled value.
- change location to work location
- The empty state of the global search was not working properly on DarkMode.

**Improvements**
- At the center of the call screen, a notification of network loss and connection establishment must appear.
- Altered logic to convert a one-to-one call to a group call once any extra participant is added, updated call history is available, and an active conference cell is available as well.
- Fixed spelling and grammatical errors on the website.
- Coaches should remove orphan tours; applications freeze when switching suddenly.
- The file manager's document list was missing in dark mode.
- Added button interaction on the click event.

**New Features**
- Implement the user feedback design on the web application (UI part).
- New website design


## Version 107.0.6 : Date - 10 - 16 March 2023

**Bug Fixes**
- Translation popup giving API status - Fixed
- Personal room: When we send the file in the in-call chat, at the receiver's end, the download and share buttons are missing on that file.
- Calls: When we download any file from the in-call chat, the call screen moves to the background.
- The sender name issue in place of you was wrong, and vice versa.
- On third-person typing, the current user's application gets frozen.
- Dark mode issues fixes.
- Calendar external add invite user issue
- Fix website UI issues.
- Fix blog UI issues.
- Sign Up: Password Condition Alert Text Overlaps on the Create Account Button on the Sign Up Page
- Calendar invited 'external user' cell UI is not correct - fixed

**Improvements**
- Chat module: implement the email chat design to include a message-writing option in an email chat.

**New Features**
- Update the website and blog pages.
- Implemented Design of Admin Panel.


## Version 107.0.5 : Date - 3 - 10 March 2023

**Bug Fixes**
- Changed the message on the in-call chat to an empty state
- Change dashboard template CSS position
- The Add button on the email chat is not consistent with the MEL standard.
- worked on the meeting UI issue of the chat panel and message cell.
- When we download any file from the in-call chat, the call screen moves to the background.
- M.O.M/US  Time tasks:  Chat module:  Files:  This is the first time that redirection from the files tab is not working properly; it is not redirecting to the specific attachment in the chat.
- When we drag and drop any file in the in-call discussion of any user, the file is not uploading.

**Improvements**
- Create logic to inform the user about the latest changes, clear the cache automatically, and load the new changes.
- At the center of the call screen, the notification of network loss and connection establishment must appear.
- In some cases, the message delete button does not disappear after 15 minutes.

**New Features**
- Dark Mode implementation


## Version 107.0.4 : Date - February 24 - March 3, 2023

**Bug Fixes**
- Wrong empty state issue
- When we preview any image and click outside the image preview, the image preview screen is not closed.
- When we select the business or individual tab and then click on the back button, the back button is not working.
- Auth login/signup error handling
- Handle cancel on auth login for calendar
- The empty state of the global search overlaps all modules.
- When we scroll any tab of the file manager and then move to the other module, the page number should be reset.
- Worked on the in-call chat scroll issue
- Wrong Empty State Issue: Resolved
- When we scroll up any tab of the file manager and then move to the other module, if we again go to the file manager and scroll up, the data is not loading.
- File Download Issue: Resolved
- Worked on reply cell for in-call chat -- UI issue -- resolved
- In-Call Chat Emoji Icons UI Issues: Resolved
- Worked on meeting creation with additional participant UI issues; resolved
- Worked on group dot icon issues that were not coming in the right place; - resolved

**Improvements**
- Add a tag to the user in the team list
- Remove chat background.
- Total file size limit at the time of upload handled (max count: 10; max size: 50MB)
- Added the coworker/network tag to the team participant list.

**New Features**
- Integrate the onboarding experience on WebApp
- Implement gifs in call chat.


## Version 107.0.3 : Date - 17 - 23 Feb 2023

**Bug Fixes**
- Change the icon, and on hover, copy the link.
- An issue on the first attempt to send a message.
- The Connect button of the Google or Microsoft calendar is cropped on the Connect calendar page.
- Already saved email and password overlap with the entered email and password placeholders.
- Align the copy link icon on the dashboard.
- Network Description align issue - fixed.
- The Add Members UI is not correct when we select the users to add to the team group.
- Mime Type issue.
- Message: When we cancel uploading any file in the chat, we then retry to upload it so it is not again uploaded.
- Multiple scrolls are appearing in the input text box of the chat window on the Firefox browser.
- Read more on this issue in 100 words.
- In-call chat screen responsiveness issues
- Loading chat issues and handling the empty state

**Improvements**
- Imeeting or Emeeting on Call Hangup -- Redirect to the MELPA website.
- On February 17, 2023, minor dashboard content changes were discussed with Venk sir.
- Change the width from 1200 to 1024 on hover for the sub-menu (the sub-menu doesn't appear in some cases).
- All loaders should be changed in the complete application.
- Remove repetitive number condition from password criteria.
- Implement the updated design of the profile card.
- Read more about the 100-word issue.
- Implemented a new global search entity state.
- Worked on the changes provided by Nidhi

**New Features**
- Add a contact option to email chat.
- Added yesterday's text on the chat


## Version 107.0.2 : Date - 10 - 16 Feb 2023

**Bug Fixes**
- Increase reply cell width
- While Sign Up  When we leave a space in the Working as or Service Offered field (without entering any text), then the Get Started button is activated.
- Add an empty state to the event type.
- Calendar: The attachment icon UI is not correct on the Create meeting page.
- Calendar: If there is no meeting scheduled for the day, then the date overlaps with the text "No events scheduled for the day."
- When we select the next month's date, then that day's meeting list is not open (showing no meetings scheduled for that day).
- When we select more options for any team, more options hide behind the input text field of the chat box.
- Worked on responsiveness for the menu - Website
- fixed zoom-in/zoom-out the problem
- Remove caret from emoji

**Improvements**
- Network module: Implement the updated design of the profile card.
- Implement the sales contact page design.
- Include an appointment-booking icon in the notification panel.
- On enter line break and send a message.
- Need to update the bulk invite popup screen to provide information about the mandatory fields required to upload any CSV file.

**New Features**
- Implemented sub-calendar
- Implemented functionality of the Individual and Business screens.
- Update the remove/add admin rights design.
- The Enter option has an option in which the user needs to select whether he wants to send the message by clicking enter or, by clicking enter, the input text field shifts to the next line.
- The whiteboard functionality is done and deployed on SPA.
- Private Room module: implement the design of joining MelpApp after the private room call for the mobile view.
- Create a sales contact page for your website.



## Version 107.0.1 : Date - 03 - 09 Feb 2023

**Bug Fixes**
- change 'no I declined'  In a meeting, text "No, I will not attend.".
- Preventing close popup clicks outside of the preview video.
- The name of the sender should be consistent (you or name) in the middle panel below the group or team name and the right panel chat box.
- Muted notification UI issue.
- Calendar: In the 90% and below 90% screen resolution, the month view calendar shows blank.
- Changed "add to call the message".
- Receiving "br>" or "n" in the message text when we send or receive a long text message and click on the "read more" button on that text message.
- "The No Description" text is missing from the Calendar meeting details screen.
- Prevent video playback on an unchecked icon.
- Changed message to "add to call".
- Increase the gap between the Accept or Decline button on the Waiting Participants popup.
- Change the loading text on the call screen to "Please wait while connecting."
- Update the text of the header on the bulk invite popup to "Upload Contacts" Use shared in the file manager.
- An alignment issue is coming with the new messages received in the message tray.
- Update the translation and GIF icon according to the updated design.
- Update the URL of the "Contact Us" page on the new website.
- Change the input placeholder to "Write a message or drag files to upload."
- A recording issue is coming to the DevSPA. When we stop the recording, no sound is coming from the moderator's side for the stop recording notification.
- The participants list overlaps with the top frame when scrolling in the normal view.
- A red border is not appearing on the frame of the participant when someone speaks.
- Calls: The share screen icon is wrong on the JITSI calling screen on WebApp.

**Improvements**
- Required a separate heading icon for the appointment booking meeting notifications of the calendar.
- Show the Internet connection lost message on the web app globally.
- Change meeting active notify icon.
- Change the width for the dashboard and file manager.
- On the calling popup, replace the text "one-to-one" with "network" or "coworker" in a one-to-one call.
- Add network and coworker tags in the active conference for one-to-one.
- Required separate heading for the appointment booking meeting notifications of the calendar.
- Upgrade Etherpad to the latest version (upgraded to version 1.9.0).
- Implement the filter dropdown and update the design of the meeting details for the recent meetings.
- Implement the forwarded file tag in the chat.
- The chat message text field should be expanded automatically when we copy and paste any long message. Implemented the latest design for this.
- Change the color of the raised hand border from red to white.
- Calls: Change the icon size from 22*22 to 16*16 on the calling screen (the icon size and text of the normal view should be the same as the share screen).
- Calls: Change the raised hand, mic, and camera backgrounds (white background with grey icon color)
- Calls: Change the position of the Recording button; it should appear on the top left corner with a blinking dot and REC text in small font.
- Calls: Remove the "flip" option from the other options on the calling screen.
- Calling module: Adjust the size of the virtual backgrounds of Melp to the same as per the JITSI virtual backgrounds.

**New Features**
- Implement a privacy policy for using GIFs in the chat.
- Introduced a proper centralized exception handler.   
- Add an image preview option for in-call chat. 
- Implement the design of the "Next-Previous Page" preview screen on the File Manager.
- In iMeeting and eMeeting calls, an image preview option has been added.
- Integrate the Abiword library with MelpPad to allow import/export functionality.


## Version 107.0.0 : Date - 23 Jan 2022 - 2 Feb 2023

**Bug Fixes**
- The Active Call button does not deactivate once the call hangs up from the user's end.
- fixed message notification issues.
- If the image is not valid, then implement a thumbnail in chat and file manager.
- When we reply to any video file in the chat, the video preview on the replied message is not correct.
- Recent: Meeting/Calendar: A scroll bar is appearing on the meeting details in the Firefox browser even if the description is not available.
- Messages: The attachment name overlaps on the preview when we reply to any attachment in the chat.
- Play the video icon and stop the video after closing the preview on website

**Improvements**
- In-call message notification is not coming through.
- All Jitsi calls are upgraded to the 8218 version.
- Define upload type in upload/v2.
- Changed `might be` to `maybe` in meeting details status section.
- Replaced all loaders with ring loader on entire app.
- Change my meeting room to a private room and multiple invites to bulk invite.
- Hide input area in recent call chat.
- Rename waiting participants.
- Remove alert on request OTP of deleting an account.
- Altered the call module architecture to add functionality for one call at a time.
- Optimise the code implementation for file uploads.
- Added a search option on team panel.

**New Features**
- Implemented logic to show private room call history in recent calls.
- Implemented logic to send "User busy status" to the initiator.
