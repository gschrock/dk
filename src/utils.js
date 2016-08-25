import Tile from './sprites/Tile'

export const setResponsiveWidth = (sprite, percent, parent) => {
  let percentWidth = (sprite.texture.width - (parent.width / (100 / percent))) * 100 / sprite.texture.width
  sprite.width = parent.width / (100 / percent)
  sprite.height = sprite.texture.height - (sprite.texture.height * percentWidth / 100)
}

// TODO: clean up
export const generateMapGroup = (game, player) => {
	// create group for all the map tiles
	const group = game.add.group();
	group.enableBody = true;

	// tiles are found in frames/tileset.png
	const tileArray = [];
	tileArray[0] = 'stone';
	tileArray[1] = 'grass';
	tileArray[2] = 'water';
	tileArray[3] = 'watersand';
	tileArray[4] = 'sand';
	tileArray[5] = 'sandstone';
	tileArray[6] = 'bush2';
	tileArray[7] = 'wood';
	tileArray[8] = 'window';
	tileArray[9] = 'grasssand';

	// example level using tiles defined above
	const level1 = [
		[6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6],
		[6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6],
		[6, 0, 1, 1, 1, 1, 1, 1, 1, 0, 6],
		[6, 0, 1, 0, 0, 0, 0, 0, 1, 0, 6],
		[6, 0, 1, 1, 1, 1, 1, 1, 1, 0, 6],
		[6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6],
		[6, 8, 8, 8, 0, 0, 0, 8, 8, 8, 6],
		[6, 6, 6, 6, 0, 0, 0, 6, 6, 6, 6],
		[9, 9, 9, 9, 7, 7, 7, 9, 9, 9, 9],
		[3, 3, 3, 3, 7, 7, 7, 3, 3, 3, 3],
		[2, 2, 2, 2, 7, 7, 7, 2, 2, 2, 2]
	];

	// tile size
	const size = 32;

	// array to store water objects, water animates in game.js update function
	game.water = [];

	// TODO: clean up, make more modular
	// this creates the actual level and generates tiles
	for (let y = size; y <= game.physics.isoArcade.bounds.frontY - size; y += size) {
		for (let x = size; x <= game.physics.isoArcade.bounds.frontX - size; x += size) {
			// get coordinates for isometric easystar pathfinding
			let isoX = (x / size) - 1;
		  let isoY = (y / size) - 1;

		  // create tile object, adds tile to game
			let obj = new Tile({
				game,
				player,
				x,
				y,
				z: 0,
				tilesheet: 'tileset',
				tile: tileArray[level1[isoY][isoX]],
				group
			})

			// TODO: clean this up
			// some tiles have different heights
			if (level1[isoY][isoX] === 8) { // window
				obj.tile.isoZ = 45;
			} else if (level1[isoY][isoX] === 6) { // bush2
				obj.tile.isoZ = 14;
			} else if (level1[isoY][isoX] === 2) { // water
				game.water.push(obj);
			} else if (level1[isoY][isoX] === 7) { // wood
				obj.tile.isoZ = 3;
			}

			obj.tile.inputEnabled = true;
			obj.tile.anchor.set(0, 0);
			obj.tile.smoothed = false;
			obj.tile.body.moves = false;
		}
	}

	// create instance of easystar pathfinding and assign the level
	game.easystar = new EasyStar.js();
  game.easystar.setGrid(level1);

  // define walkable tiles
  game.easystar.setAcceptableTiles([0,1,7]); // stone, grass, wood

  return group;
}

// delays movements to each new position
export const handleMovement = (path, player, game) => {
	// TODO: make the movement functionality better? Could make use of game.js or player.js update function?
	// passes each step generated by easystar to player with a delay
  const delaySteps = () => {
  	setTimeout(() => {
  		if (path.length) {
  			player.moveToPosition(path[0].x, path[0].y);
  			path.shift();
  			delaySteps();
  		}
  	}, 500);
  }

  delaySteps();
}