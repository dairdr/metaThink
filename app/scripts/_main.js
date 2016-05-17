'use strict';
/**
 *
 *
 */
var MetaThink = (function(window, undefined){
	var _config = {
		name: 'MetaThink main module',
		events: {
			click: 'click',
			ready: 'ready',
			resize: 'resize',
			focusout:'focusout',
			keypress:'keypress',
			keydown: 'keydown',
			scroll:'scroll'
		},
		keyCode: 13,
		deleteKeyCode: 46,
		dom: {
			canvas: 'stage',
			propertiesBar: 'div#properties-bar',
			tools: 'a.tool',
			toolActive: 'a.active',
			root: '#root',
			save: '#save',
			viewXML: '#view-xml',
			codeXML: '#code-xml'
		}
	};

	var _canvas = null;
	var _context = null;
	var _focusedObject = null;
	var _toolSelected = null;
	var _firstObject = null;
	var _propertyBar = {
		label: {},
		width: {},
		height: {},
		x: {},
		y: {},
		class: {}
	};
	var _objects = [
		{name:'meta-level', class:'MetaLevel'},
		{name:'object-level', class:'ObjectLevel'},
		{name:'sensor', class:'Sensor'},
		{name:'profile', class:'Profile'},
		{name:'explanation', class:'Explanation'},
		{name:'reasoning-failure', class:'ReasoningFailure'},
		{name:'goal', class:'Goal'},
		{name:'failure-solution-plan', class:'FailureSolutionPlan'},
		{name:'monitoring-task', class:'MonitoringTask'},
		{name:'goal-generation', class:'GoalGeneration'},
		{name:'failure-explanation', class:'FailureExplanation'},
		{name:'failure-detection', class:'FailureDetection'},
		{name:'profile-generation', class:'ProfileGeneration'},
		{name:'control-task', class:'ControlTask'},
		{name:'plan-configuration', class:'PlanConfiguration'},
		{name:'control-activation', class:'ControlActivation'},
		{name:'plan-execution', class:'PlanExecution'},
		{name:'strategy-selection', class:'StrategySelection'},
		{name:'computational-data', class:'ComputationalData'},
		{name:'reasoning-trace', class:'ReasoningTrace'},
		{name:'strategy', class:'Strategy'},
		{name:'computational-strategy', class:'ComputationalStrategy'},
		{name:'cognitive-task', class:'CognitiveTask'},
		{name:'reasoning-task', class:'ReasoningTask'},
		{name:'reasoning-plan', class:'ReasoningPlan'},
		{name:'cost-calculation', class:'CostCalculation'},
		{name:'generates', class:'Generates'},
		{name:'detects', class:'Detects'},
		{name:'has', class:'Has'},
		{name:'reads', class:'Reads'},
		{name:'enables', class:'Enables'},
		{name:'uses', class:'Uses'},
		{name:'recommends', class:'Recommends'},
		{name:'starts', class:'Starts'},
		{name:'insert-task', class:'InsertTask'},
		{name:'monitors', class:'Monitors'}
	];

	/**
	 * Init module.
	 *
	 */
	function init(){
		_canvas = document.querySelector('#stage');
		setUpPropertiesBar($(_config.dom.propertiesBar));
		adjustStage();
		setAccordion();
		initCanvas();
		listenToolbarSelection();
		$(document).on(_config.events.keydown, deleteKeyPressCallbak);
		$(document).on('opening', '.remodal', function () {
	  	var text = "<root>"+$(_config.dom.root).html()+"</root>";
	  	var $code = $(_config.dom.codeXML);
	  	$code.text(text);
	  	$('pre code').each(function(i, block) {
		    hljs.highlightBlock(block);
		  });
		});
	}

	/**
	 * Setup properties bar.
	 *
	 */
	function setUpPropertiesBar(bar){
		_propertyBar.label = $(bar).find('input.label');
		_propertyBar.width = $(bar).find('input.width');
		_propertyBar.height = $(bar).find('input.height');
		_propertyBar.x = $(bar).find('input.x');
		_propertyBar.y = $(bar).find('input.y');
		_propertyBar.class = $(bar).find('input.type');

		for(var item in _propertyBar){
			$(_propertyBar[item]).on(_config.events.focusout, focusOutCallbak);
			$(_propertyBar[item]).on(_config.events.keypress, keyPressCallbak);
		}
	}

	/**
	 * Add listener for tool bar.
	 *
	 */
	function listenToolbarSelection(){
		$(_config.dom.tools).on(_config.events.click, toolSelectedCallback);
	}

	/**
	 * Tool selected callback.
	 *
	 */
	function toolSelectedCallback(event){
		var obj = event.target;
		while(obj.tagName.toLowerCase() !== 'a'){
			obj = obj.parentNode;
		}
		$(_config.dom.toolActive).removeClass('active');
		$(obj).addClass('active');
		var t = $(obj).attr('t');
		
		var found = false;
		var i = 0;
		while(!found && i < _objects.length){
			if(_objects[i].name === t){
				found = true;
				_toolSelected = _objects[i].class;
			}
			i += 1;
		}
	}

	/**
	 * Focusout callback.
	 *
	 */
	function focusOutCallbak(event){
		updateObjectProperties();
	}

	/**
	 * Key press callback.
	 *
	 */
	function keyPressCallbak(event){
		var keycode = (event.keyCode? event.keyCode: event.which);
		if(keycode === _config.keyCode){
			updateObjectProperties();
		}
	}

	/**
	 * Delete an element from stage.
	 *
	 */
	function deleteKeyPressCallbak(event){
		var keycode = (event.keyCode? event.keyCode: event.which);
		if(keycode === _config.deleteKeyCode){
			if(_focusedObject !== null){
				if(_focusedObject.shapeType === 'rectangular' && _focusedObject.lines){
					// eliminar elemento.
					for(var j in _focusedObject.lines){
						_focusedObject.lines[j].line.remove();
					}
					while(_focusedObject.lines.length > 0){
						_focusedObject.lines.pop();
					}
					_focusedObject.lines.splice(0, _focusedObject.lines.length);
				}else if(_focusedObject.shapeType === 'rectangular' && !_focusedObject.lines){
					// eliminar contenedor
					for(var i in _focusedObject.children){
						if(_focusedObject.children[i].lines){
							for(var k in _focusedObject.children[i].lines){
								if(_focusedObject.children[i]){
									if(_focusedObject.children[i].lines[k]){
										_focusedObject.children[i].lines[k].line.remove();
									}
								}
							}
							if(_focusedObject.children[i]){
								while(_focusedObject.children[i].lines.length > 0){
									_focusedObject.children[i].lines.pop();
								}
							}
						}
					}
				}
				_focusedObject.remove();
				_focusedObject = null;
				cleanPropertiesBar();
				_context.redraw();
			}
		}
	}

	/**
	 * Clean properties bar.
	 *
	 */
	function cleanPropertiesBar(){
		updatePropertiesBar({
			label: '',
			width: '',
			height: '',
			x: '',
			y: '',
			class: ''
		});
	}

	/**
	 * Update object focused's properties.
	 *
	 */
	function updateObjectProperties(){
		if(_focusedObject !== null){
			if(_focusedObject.setWidth && _focusedObject.shapeType === 'rectangular'){
				_focusedObject.setWidth(parseInt($(_propertyBar.width).val()));
			}
			if(_focusedObject.setHeight && _focusedObject.shapeType === 'rectangular'){
				_focusedObject.setHeight(parseInt($(_propertyBar.height).val()));
			}
			if(_focusedObject.x && _focusedObject.shapeType === 'rectangular'){
				_focusedObject.x = parseInt($(_propertyBar.x).val());
			}
			if(_focusedObject.y && _focusedObject.shapeType === 'rectangular'){
				_focusedObject.y = parseInt($(_propertyBar.y).val());
			}
			if(_focusedObject.setText){
				_focusedObject.setText($(_propertyBar.label).val());
			}
			_context.redraw();
		}
	}

	/**
	 * Set current object focused.
	 *
	 */
	function setFocusedObject(obj){
		if(obj !== null){
			_focusedObject = obj;
		}
	}

	/**
	 * Gets tool selected.
	 *
	 */
	function getToolSelected(){
		return _toolSelected;
	}

	/**
	 * Adjust stage to fit with screen size.
	 *
	 */
	function adjustStage(){
		var canvasContainer = document.querySelector('#main div.right div.stage-container');
		var header = document.querySelector('#wrapper > header');
		var headerHeight = parseInt($(header).css('height'));

		var propertiesBar = document.querySelector('#properties-bar');
		var propertiesBarHeight = parseInt($(propertiesBar).css('height'));
		$(canvasContainer).css('height', window.innerHeight - (headerHeight + propertiesBarHeight));
	}

	/**
	 * Set accordion.
	 *
	 */
	function setAccordion(){
		$('#accordion').accordion({
			heightStyle: 'content',
			header: '> .category > .header'
		});
		$('div.sub-menu').accordion({
			heightStyle: 'content',
			header: '.sub-category > .sub-header'
		});
	}

	/**
	 * Update properties bar.
	 *
	 */
	function updatePropertiesBar(data){
		for(var item in data){
			$(_propertyBar[item]).val(data[item]);
		}
	}

	/**
	 * Build canvas.
	 *
	 */
	function initCanvas(){
		_canvas.width = window.innerWidth * 2;
		_canvas.height = window.innerHeight * 2;
		_context = oCanvas.create({
			canvas: _canvas,
			background: '#fff'
		});
		_context.bind(_config.events.click, canvasClickCallback);
	}

	/**
	 * Canvas click callback.
	 *
	 */
	function canvasClickCallback(event){
		if(getToolSelected() !== null){
			var o = _context.display[getToolSelected()]({
				x: _context.mouse.x,
				y: _context.mouse.y,
				updateProperties: updatePropertiesBar,
				setFocusedObject: setFocusedObject,
				getToolSelected: getToolSelected,
				addNewChild: addNewChild
			});
			if(o.nestingRules && o.nestingRules.parent && o.nestingRules.parent.length > 0){
				_context.addChild(o);
				_toolSelected = null;
				$(_config.dom.toolActive).removeClass('active');

				// Build xml
				var node = "<context id='$id' type='$type'></context>"
					.replace("$id", o.id)
					.replace("$type", o.type);
				$(_config.dom.root).append(node);
			}else{
				console.log('this object can not be added directly on stage.');
			}
		}else{
			// Limpiamos el elemento seleccionado.
			_focusedObject = null;
			cleanPropertiesBar();
		}
	}

	/**
	 * Canvas keydown callback.
	 *
	 */
	function canvasKeydownCallback(event){
		if(event.keyCode === _config.deleteKeyCode){
			if(_focusedObject !== null){
				_focusedObject.remove();
				for(var i in _propertyBar){
					$(_propertyBar[i]).val('');
				}
				_context.redraw();
			}
		}
	}

	/**
	 *
	 *
	 */
	function canvasFocusoutCallback(event){
		console.log('focos out');
	}

	/**
	 * Add new object to stage.
	 *
	 */
	function addNewChild(obj, c){
		var o = _context.display[c]({
			x: _context.mouse.x - obj.x,
			y: _context.mouse.y - obj.y,
			updateProperties: updatePropertiesBar,
			setFocusedObject: setFocusedObject,
			getToolSelected: getToolSelected,
			drawLine: drawLine
		});
		obj.addChild(o);
		console.log(obj);
		console.log(o);
		cleanToolsBar();

		// Build xml
		var node = "<element id='$id' type='$type' />"
			.replace("$id", o.id)
			.replace("$type", o.type);
		$(_config.dom.root)
			.find("#"+obj.id)
			.append(node);

		for(var item in dependencesRules){
			if(dependencesRules[item].class === c){
				var d = dependencesRules[item].generate;
				for(var i in d){
					drawRelatedObject(d[i].class, o, d[i].container, d[i].relationship);
				}
			}
		}
	}

	/**
	 * Clean the tool bar.
	 *
	 */
	function cleanToolsBar(){
		_toolSelected = null;
		$(_config.dom.toolActive).removeClass('active');
	}

	/**
	 * Draw objects related.
	 *
	 */
	function drawRelatedObject(c, obj, container, rel){
		var o = _context.display[c]({
			x: obj.x + (obj.width) + 50,
			y: obj.y,
			updateProperties: updatePropertiesBar,
			setFocusedObject: setFocusedObject,
			getToolSelected: getToolSelected,
			drawLine: drawLine
		});

		var found = false;
		var i = 0;
		while(!found && i < _context.children.length){
			if(_context.children[i].class && _context.children[i].class === container){
				found = true;
				_context.children[i].addChild(o);

				var line = _context.display[rel]({
					env: 'e',
					setFocusedObject: setFocusedObject,
					updateProperties: updatePropertiesBar
				});
				if(o.parent.class === obj.parent.class){
					// La linea se dibujara dentro del mismo contenedor de
					// los elementos relacionados.
					line = _context.display[rel]({
						env: 'l',
						setFocusedObject: setFocusedObject,
						updateProperties: updatePropertiesBar
					});
					obj.parent.addChild(line);
					line.zIndex = 0;
					_context.redraw();
				}else{
					// La linea se dibujara directamente en el canvas porque
					// los objetos relacionados estan en diferentes contenedores.
					_context.addChild(line);
				}
				obj.lines.push({line:line, observe:'start'});
				o.lines.push({line:line, observe:'end'});

				// Build xml
				var node = "<element id='$id' type='$type' />"
					.replace("$id", o.id)
					.replace("$type", o.type);
				$(_config.dom.root)
					.find("#"+o.parent.id)
					.append(node);

				node = "<relationship id='$id' type='$type' from='$from' to='$to' />"
					.replace("$id", line.id)
					.replace("$type", line.type)
					.replace("$from", obj.id)
					.replace("$to", o.id);
				$(_config.dom.root)
					.append(node);
			}
			i += 1;
		}

		if(!found){
			// la generacion automatica no se puede completar porque no existe un contenedor valido dentro del stage.
			console.log('error de generacion automatica.');
		}
	}

	/**
	 *
	 *
	 */
	function drawLine(obj){
		var c = getToolSelected();
		var rules = obj.relationshipRules;
		if(_firstObject === null){
			console.log('Primer elemento seleccionado para hacer la relacion.');
			if(searchInsideArray(obj, rules, 'class', c)){
				console.log('Elemento valido para hacer una relacion.');
				_firstObject = obj;
			}else{
				console.log('No se permite la relacion de este objeto con otro.');
				cleanToolsBar();
			}
		}else{
			if(_firstObject.id !== obj.id){
				console.log('Segundo elemento seleccionado para hacer la relacion.');
				if(searchInsideArray(obj, rules, 'endpoint', c)){
					console.log('Elemento valido para hacer una relacion.');

					if(!existAnyRelationship(_firstObject, obj)){
						console.log('haciendo la relacion...');
						var line = _context.display[c]({
							setFocusedObject: setFocusedObject,
							updateProperties: updatePropertiesBar
						});
						if(_firstObject.parent.class === obj.parent.class){
							line.env = 'l';
							obj.parent.addChild(line);
							line.zIndex = 0;
							_context.redraw();
						}else{
							line.env = 'e';
							_context.addChild(line);
						}
						_firstObject.lines.push({line:line, observe:'start'});
						obj.lines.push({line:line, observe:'end'});

						// Build xml
						var node = "<relationship id='$id' type='$type' from='$from' to='$to' />"
							.replace("$id", line.id)
							.replace("$type", line.type)
							.replace("$from", _firstObject.id)
							.replace("$to", obj.id);
						$(_config.dom.root)
							.append(node);
					}else{
						//console.log('la relacion se repite entre los elementos');
						console.log('ya existe una relacion entre los dos elementos');
						console.log('no se hara la relacion');
					}
					_firstObject = null;
					cleanToolsBar();
				}else{
					console.log('No se permite la relacion de este objeto con otro.');
					_firstObject = null;
					cleanToolsBar();
				}
			}else{
				console.log('Ha seleccionado dos veces el mismo elemento');
				_firstObject = null;
				cleanToolsBar();
			}
		}
	}

	/**
	 * Check if exist the same relationship between 2 elements.
	 *
	 */
	function existSameRelationship(firstObject, obj, c){
		var i = 0;
		var found = false;
		var f = false;
		while(!found && i < firstObject.lines.length){
			if(firstObject.lines[i].line.class === c){
				var k = 0;
				while(!f && k < obj.lines.length){
					if(firstObject.lines[i].line.id === obj.lines[k].line.id){
						found = true;
						f = true;
					}
					k += 1;
				}
			}
			i += 1;
		}
		return (!found && !f)? false: true;
	}

	/**
	 * Check if exist any relationship between 2 elements.
	 *
	 */
	function existAnyRelationship(firstObject, obj){
		var i = 0;
		var found = false;
		var f = false;
		while(!found && i < firstObject.lines.length){
			var k = 0;
			while(!f && k < obj.lines.length){
				if(firstObject.lines[i].line.id === obj.lines[k].line.id){
					found = true;
					f = true;
				}
				k += 1;
			}
			i += 1;
		}
		return (!found && !f)? false: true;
	}

	/**
	 *
	 *
	 */
	function searchInsideArray(obj, rules, attr, rel){
		var found = false;
		var i = 0;
		while(!found && i < rules.length){
			if(obj.class === rules[i][attr] && rules[i].relationship === rel){
				found = true;
				return true;
			}
			i += 1;
		}
		return false;
	}

	return {
		init: init,
		config: _config
	};
}(window));

MetaThink.init();