# cryptids tcg

cryptids tcg is an event based game platform designed for trading card games

games within cryptids are designed using events, rules, and instructions

## Events

`game:start` - indicates that the game has started
`turn:start` - indicates that a players turn is starting
`turn:end` - indicates that a players turn is ending
`phase:[name]:start` - indicates that a turn phase is starting
`phase:[name]:end` - indicates that a turn phase is ending
`card:draw` - emitted when player draws a card
`card:play` - emitted when player plays a card
`card:move`
