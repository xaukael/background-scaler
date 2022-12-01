Hooks.on('renderSceneConfig', async (app, html)=>{
  html.find('button.grid-config').after($(`<button type="button" class="background-scaler" title="Background Scaler"> <i class="fa-regular fa-square-full"></i></button>`)
  .click(async function(){
		app.minimize();
		
		let points = [];
		let sizes = [];
		let offsetX = 0;
		let offsetY = 0;
		let $div = $(`<div class="canvas-cover" style="position: absolute; display: block; 
				pointer-events: all; cursor: crosshair; 
				background-image: 
					repeating-linear-gradient(#f00 0 3px, transparent 3px 100%),
					repeating-linear-gradient(90deg, #f00 0 3px, transparent 3px 100%);
				background-position: top ${canvas.scene.background.offsetY}px left ${canvas.scene.background.offsetX}px;
				height: ${canvas.scene.dimensions.sceneRect.height}px; width:${canvas.scene.dimensions.sceneRect.width}px;
				background-size: ${canvas.dimensions.size}px ${canvas.dimensions.size}px;
				left: ${canvas.scene.dimensions.sceneRect.x}px; top: ${canvas.scene.dimensions.sceneRect.y}px;">
				<center class="help-text" style="position: absolute; color: white; pointer-events: none; width: 150px; height: max-content; border: 1px solid var(--color-border-dark);border-radius: 5px; background-image: url(../ui/denim075.png); padding: .5em; margin: 1em;" ><center>
				</div>`);
		//background-color: rgba(0, 255, 0, 0.01);
		$div.find('.help-text').html("Zoom in a lot to be very accruate with your click. <br><br>Click a top left corner of a grid square on the image.");
		$div.click(async function(e){
			let local = canvas.app.renderer.plugins.interaction.mouse.getLocalPosition(canvas.app.stage)
			points.push(local);
			if (points.length<2) return $(this).find('.help-text').html("Click a bottom right corner of the same grid square on the image.");
			// array distances between the x's and y's
			let distances = points.reduce((a,p,i,arr)=>{
				if (!arr[i+1]) return a;
				a.push(arr[i+1].x-p.x);
				a.push(arr[i+1].y-p.y);
				return a
			},[])
			
			if (points.length!=2) return;
			// if we have at least two points and thus distances has something, get the average distance
			sizes.push(distances.reduce((a,x)=>a+=x)/distances.length)
			
			// average distances to get the probable image grid size
			let imageGridSize =  sizes.reduce((a,x)=>a+=x)/sizes.length
			
			// set offset of new grid size for preview
			offsetX =e.offsetX%imageGridSize
			offsetY =e.offsetY%imageGridSize
			
			$(this).css('background-size', `${imageGridSize}px ${imageGridSize}px`);
			$(this).css('background-position', `top ${offsetY%imageGridSize}px left ${offsetX%imageGridSize}px`);
			points = [];
			$(this).find('.help-text').html("Right Click to apply this grid. <br><br>Click a top left corner of a grid square on the image if you would like to retry.");
		});
		$div.contextmenu(async function(e){
			
			// basically get the variables from the preview which will do nothing if nothing has been changed
			let imageGridSize = Number($(this).css('background-size').split(' ')[0].split('px')[0])
			let scale = canvas.grid.size/imageGridSize;
			let width = Math.round(canvas.scene.width*scale)
			let height = Math.round(canvas.scene.height*scale)
			// update the offsets to the new scale
			offsetX *=scale;
			offsetY *=scale;
			$(`div.canvas-cover`).remove();
			let updates = { background: { offsetX, offsetY }, width, height }
			await canvas.scene.update(updates)
			app.maximize();
		});
		
		$div.mousemove(function(e){
			e.preventDefault()
			e.stopPropagation()
			let scale = canvas.app.stage.transform.localTransform.a;
			let rect = e.target.getBoundingClientRect();
			let x = (e.clientX - rect.left)/scale;
			let y = (e.clientY - rect.top)/scale;
			$(this).find('.help-text').css({top: y+'px',left: x+'px'})
		});
		
		
		$div.on('wheel', async function(e){
				let scale = canvas.app.stage.transform.scale.x;
				let x,y;
				let dz = ( e.originalEvent.deltaY < 0 ) ? 1.05 : 0.95;
				if (e.ctrlKey) canvas.pan({x: e.offsetX, y: e.offsetY, scale: canvas.stage.scale.x})
				else canvas.pan({x, y, scale: dz * canvas.stage.scale.x})
			});
		$('#hud').append($div)
		// grid setter code---------------------------------------
    
  }))
})