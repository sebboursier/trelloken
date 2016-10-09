# trelloken

  Usage: index [options]

  Options:

    -h, --help                        output usage information
    -V, --version                     output the version number
    -G, --getToken                    Get the token user by your default browser
    -S, --setToken [TOKEN]            Set the user token
    -o, --offline                     To post data offline
    -P, --push                        To syncro datas set offline on Trello
    -L, --listing                     Action of listing
    -A, --adding                      Action of adding
    -M, --moving                      Action of moving (for a card ONLY)
    -t, --to [DESTINATION_LIST_NAME]  a destination list (for moving)
    -b, --board [BOARD_NAME]          Action on a board
    -l, --list [LIST_NAME]            Action on a list
    -c, --card [CARD_NAME]            Action on a card

  Examples:

   # Listing Online

    $ trelloken -Lb
        This will list all your boards

    $ trelloken -b [BOARD_NAME] -Ll
        This will list all your lists of an existing board.

    $ trelloken -b [BOARD_NAME] -l [LIST_NAME] -Lc
        This will list all your card of your existing list of your existing board.

   # Adding Online

    $ trelloken -Ab [BOARD_NAME]
        This will add a board.

    $ trelloken -b [BOARD_NAME] -Al [LIST_NAME]
        This will add a list in a board.

    $ trelloken -b [BOARD_NAME] -l [LIST_NAME] -Ac [CARD_NAME]
        This will add a card in a list in a board.

   # Moving Online

    $ trelloken -b [BOARD_NAME] -l [LIST_NAME] -Mc [CARD_NAME] -t [DESTINATION_LIST_NAME]
        This will add a card in a list in a board.

  Notes:

    If your parameter contain space, write it between quote : "some board"

    You can specify [parameters] in the command, otherwise there will be asked
