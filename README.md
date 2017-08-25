SETUP
1. Create postgres database called 4UM
Query: "CREATE DATABASE 4UM"

2. Create a user for the database
    a. Username: postgres
    b. Password: pgpass
Query: "CREATE USER postgres WITH PASSWORD 'pgpass'"

3. Grant privileges for the user on the database
Query: "GRANT ALL PRIVILEGES ON DATABASE 4UM to postgres"

--------------------------------------------------------------------------------
TEST-SETUP
1. Create postgres database called 4UMTEST
Query: "CREATE DATABASE 4UMTEST"

2. Create a user for the database (if not existing)
    a. Username: postgres
    b. Password: pgpass
    Query: "CREATE USER postgres WITH PASSWORD 'pgpass'"

3. Grant privileges for the user on the database
Query: "GRANT ALL PRIVILEGES ON DATABASE 4UMTEST to postgres"

--------------------------------------------------------------------------------
Functionalities:
- User login
- User Registration
- Account Recovery
- By default,
    - Users are not subscribed to any SUB4UMs.
    - On all feeds, posts are organized by total score. They can be filtered to show the most recent posts.
    - On the home page,
        - Only loads posts from subscribed SUB4UMs.
        - Users can only post to SUB4UMs that they are subscribed to (public ones will not be visible).
            - Users can post on public SUB4UMs (without subscribing) if they navigate to the actual SUB4UM page.
            - This is to prevent the post creation modal from cluttering (if there are a large amount of public SUB4UMs created).
    - On SUB4UM page,
        - If database is new, there will be no pre-existing SUB4UMs to subscribe to.
- Post
    - Creation
        - Link posts
            - Clicking on the post title will navigate to the url that was posted.
        - Text posts
    - Voting
        - User has can only upvote or downvote a post once
        - Voting can be done on the home page, SUB4UM page, or the individual post page.
    - Each post can be viewed individually
        - Commenting on posts are ordered by most recent.
        - Comments are updated through sockets
- SUB4UMs
    - Creation
        - When a user creates a SUB4UM, they become the Admin.
            - Admins can add and remove Moderators.
            - Both Admins and Moderators can delete posts and comments within their SUB4UM.
        - If a user unsubscribes from a SUB4UM they created, it will delete the SUB4UM.
        - Types
            - Public
                - Any user can view the feed and create posts regardless of subscribing
            - Protected
                - Users can only see the name of the SUB4UM on the SUB4UM list page.
                - The feed is unavailable without subscribing.
                - Admins and mods can accept requests on the individual SUB4UM page.
            - Private
                - Users can not see the name of the SUB4UM on the SUB4UM list page.
                - The feed is unavailable without subscribing.
                - Users must receive an access code to join the SUB4UM.
                - Each SUB4UM is given one access join when it is first created.
                - Admins and mods can invite users to join their private forum by sending an invite
                    - The message will contain the required access code.
- Inbox
    - Messages that are sent to the User are only displayed in the inbox.
    - The inbox is updated through sockets.
    - Users can send a message to any existing user.
    - Unread messages are defaulted as bold. Read messages have normal font-weight.
- Profiles
    - The Profile feed only displays posts that the user created.
    - If feed will not show the User's posts from protected or private SUB4UMs unless subscribed.
    - Basic User stats shown on the side
