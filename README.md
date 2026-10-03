# Kickflip Courier

[Play the game](https://kickflip-courier.jordanw1989.chatgpt.site/)

![Kickflip Courier cover art](cover.png)

Deliver ridiculous cargo, land skateboard tricks, and outrun Mr. Bitey—the tiny Chihuahua who wants your job. An original browser arcade game with solo shifts and 2–4 player cash races for phones and laptops. No login or installation required.

## Play

Start a 60-second shift. Deliveries add time; car collisions end your run. Choose safer scenic streets or shortcuts with 50% extra delivery pay. Collect cash from tricks, grinds, near misses, delivery streaks, and perfectly timed throws. Soup and cake lose value after wipeouts.

Bitey can chase you or steal your package. Boost after him to recover stolen cargo. Collect squeaky toys or refill your bag in the skate shop; carry up to three. Your earnings, cosmetic purchases, unused toys, and personal bests save in this browser.

### Phone

- Hold the road to boost; lift your finger to slow down.
- Swipe left/right to steer, or up to jump while holding.
- Use Throw for deliveries and the small toy arrows to distract Bitey.
- Buttons remain available for steering, boost, and tricks.

### Keyboard

- Arrow keys / A and D: steer.
- Up / W / Shift: boost. Down / S: brake.
- Space: jump or trick.
- E: throw or deliver.
- Q / R: toss a toy left / right.
- Escape: pause.

## Multiplayer

Create a room and share its five-character code. The host starts when at least two players are connected. Each courier sees their own road and skater, with opponents' cash totals in the live scoreboard. Everyone races for 60 seconds on the same seeded course. The server calculates movement, actions, earnings, finish, and results. Most cash wins; ties share the promotion. Host rematch keeps the room together.

Winners celebrate in a suit and tie, holding Mr. Bitey with confetti and an original fanfare. Losing couriers get a promotion review: Bitey stamps DENIED, adds deliveries and a weekend shift, then nips at their trouser leg while they hop and cry cartoon tears. Both scenes preserve the same shared standings. Keyboard shortcuts leave name and room-code fields alone.

## Run and build

For a **solo-only** local preview, serve this repository with a static web server:

```sh
python3 -m http.server 8000
```

Open http://localhost:8000. Multiplayer needs the server and database; static hosting alone does not support room codes.

Build the production Worker with Node.js:

```sh
npm run build
```

The build embeds `dist/` client files and the authoritative room server into `dist/server/index.js`. Host this Worker with a Cloudflare Workers-compatible runtime and a D1-compatible SQLite database bound as `DB`. Apply the SQL in `drizzle/0000_tidy_the_phantom.sql` before serving multiplayer. `db/schema.ts` and `drizzle.config.ts` document the database schema. The live Sites deployment is managed separately; credentials and account-specific hosting configuration are excluded from this repository.

## Checks

With Node.js installed:

```sh
node test-engine.mjs
node test-audio.mjs
node test-multiplayer.mjs
node test-result-scenes.mjs
```

The simulation checks cover deliveries, PvE hazards, car collision endings, rail grinding, tricks, route rewards, toy inventory and distractions, cargo damage, theft recovery, streak bonuses, and mobile boost input.

Multiplayer tests use Node.js 22.13+ with its built-in SQLite module. Result-scene checks cover winner/loser selection, tied winners, and playing the correct audio once per round.

## Project files

- `dist/`: production browser source and assets (also mirrored at the root for the simple solo preview).
- `server/rooms.js`: authoritative room API, simulation, and synchronized results.
- `scripts/build.mjs`: self-contained Worker build.
- `db/` and `drizzle/`: database schema and migration.
- `engine.js`: gameplay simulation.
- `game.js`: canvas rendering, UI, controls, audio, and browser saves.
- `index.html` and `style.css`: responsive game interface.
- `dog.png`: original generated Chihuahua art used in the game.
- `cover.png`: promotional illustration created with OpenAI image generation; it is cover art rather than a gameplay screenshot.

Built with HTML, CSS, JavaScript, Canvas, and Web Audio, with OpenAI assistance. Published separately using Sites. This repository contains the portable game source and public assets; local hosting credentials and deployment configuration are excluded.

## Audio and recent polish

Tap **Sound on** to enable the original synthesized soundtrack and effects. Riding, Mr. Bitey’s entrance, the chase, and ambulance scenes have distinct audio. Wheel rumble, rail scrapes, landings, package throws, and barking accompany the action. Sound can be muted at any time.

The toy counter shows **READY** during a chase, a countdown during the 12-second cooldown, **EMPTY** when out of toys, or **CHASE ONLY** between chases. Traffic has varied paint and reflections; landings, rail entry, and deliveries have short visual feedback.

Run audio scheduling checks with `node test-audio.mjs`.

## Multiplayer responsiveness

The browser immediately shows steering, jumps, and boost while the server remains responsible for scoring and collisions. Ordered swipes are kept until acknowledged. Opponent updates contain scores and status rather than their full road state. Camera correction is gradual, and obstacles retain fixed world coordinates so the road scrolls once without snapping on each update. Phone rendering uses a lower pixel density to reduce drawing cost.

Run `node test-network-view.mjs` and `node test-mobile-network.mjs` to check rendered coordinates across delayed updates, swipe acknowledgement, duplicate inputs, and bounded prediction.

## Reconnect, sharing, and chase updates

Refreshing the same browser tab restores its room, courier identity, score, and input sequence. The room token is kept only in session storage; leaving clears it, and expired rooms return to the start screen. A connection indicator shows latency and slow/reconnecting status. Share room opens native sharing when available or copies a link that pre-fills the code. Multiplayer results compare earnings against a separate saved race best.

In both solo and multiplayer, toy pickups are scarcer, require close lane centering, and cannot be collected while airborne or grinding. The initial toy is in the left lane. When Bitey steals cargo, the HUD and his label show distance in feet, with a lane hint and remaining recovery time.

Additional checks: `node test-reconnect.mjs`, `node test-toy-difficulty.mjs`, and `node test-result-scenes.mjs`.

## Cargo challenges and status

Choose hot pizza, a glass trophy, a live lobster, or a birthday cake as your first delivery. Pizza has a 25-second heat countdown and earns up to $12 extra when delivered hot; cold pizza keeps its base pay. Trophy integrity and cake frosting bars show damage that reduces delivery value. Birthday cakes need slow, straight landings.

Lobsters count down to an escape attempt, then give a three-second warning. Press **F** or tap **Secure lobster** during that window. Escapes lose cargo and three seconds; successfully securing and delivering earns a bonus. These mechanics and HUD indicators work in solo and multiplayer, with authoritative race handling.

Run `node test-cargo.mjs` and `node test-cargo-status.mjs` for cargo behavior, payouts, secure input, countdowns, and condition indicators.

## Delivery reactions and Mr. Bitey animations

Customers react to hot or cold pizza, trophy damage, lobster deliveries, and birthday cake condition. Perfect throws use a slower catch animation with a tip burst. Delivery reactions hide during Bitey’s entrance so the cinematic stays in focus. Bitey carries a pizza slice when stealing pizza.

During chases he leaps and snaps after jumps, barks alongside grinds, scrambles after ramp tricks, shakes tossed toys, and shows CHOMP on close calls. These visuals use existing authoritative chase state and do not change collision or scoring rules. Run `node test-dog-reactions.mjs` to check reaction priority.

## Latest balance adjustments

Multiplayer starts with zero free toys; solo retains toys previously collected or bought. Combos expire after three seconds. Delivery base pay is 25% lower, trick payouts are halved, and most bonuses are roughly halved. Shop prices stay unchanged. The lobster recipient now uses a dedicated two-arm holding pose.
