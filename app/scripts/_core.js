'use strict';

CanvasRenderingContext2D.prototype.roundedRect = function(ctx,x,y,width,height,radius){
	ctx.moveTo(x, y + radius);
	ctx.lineTo(x, y + height - radius);
	ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
	ctx.lineTo(x + width - radius, y + height);
	ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
	ctx.lineTo(x + width, y + radius);
	ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
	ctx.lineTo(x + radius, y);
	ctx.quadraticCurveTo(x, y, x, y + radius);
}

var nestingRules = {
	metaLevel: {
		children: [
			{class: 'Sensor'},
			{class: 'Profile'},
			{class: 'Explanation'},
			{class: 'ReasoningFailure'},
			{class: 'Goal'},
			{class: 'FailureSolutionPlan'},
			{class: 'MonitoringTask'},
			{class: 'GoalGeneration'},
			{class: 'FailureExplanation'},
			{class: 'FailureDetection'},
			{class: 'ProfileGeneration'},
			{class: 'ControlTask'},
			{class: 'PlanConfiguration'},
			{class: 'ControlActivation'},
			{class: 'PlanExecution'},
			{class: 'StrategySelection'},
			{class: 'CostCalculation'},
			{class: 'ReasoningPlan'}
		],
		parent: [
			{class: 'Canvas'}
		]
	},
	objectLevel: {
		children: [
			{class: 'ComputationalData'},
			{class: 'ReasoningTrace'},
			{class: 'Strategy'},
			{class: 'ComputationalStrategy'},
			{class: 'CognitiveTask'},
			{class: 'ReasoningTask'}
		],
		parent: [
			{class: 'Canvas'}
		]
	}
};

var dependencesRules = [
	{
		class:'GoalGeneration',
		generate:[
			{class:'Goal', container:'MetaLevel', relationship:'Generates'}
		]
	},
	{
		class:'FailureExplanation',
		generate:[
			{class:'Explanation', container:'MetaLevel', relationship:'Generates'}
		]
	},
	{
		class:'FailureDetection',
		generate:[
			{class:'ReasoningFailure', container:'MetaLevel', relationship:'Detects'}
		]
	},
	{
		class:'ProfileGeneration',
		generate:[
			{class:'Profile', container:'MetaLevel', relationship:'Generates'}
		]
	},
	{
		class:'ReasoningTask',
		generate:[
			{class:'Profile', container:'MetaLevel', relationship:'Has'},
			{class:'ComputationalData', container:'ObjectLevel', relationship:'Generates'},
			{class:'ReasoningTrace', container:'ObjectLevel', relationship:'Generates'},
			{class:'ComputationalStrategy', container:'ObjectLevel', relationship:'Has'},
			{class:'Goal', container:'ObjectLevel', relationship:'Has'}
		]
	},
	{
		class:'ComputationalStrategy',
		generate:[
			{class:'Profile', container:'MetaLevel', relationship:'Has'}
		]
	},
	{
		class:'ReasoningTrace',
		generate:[
			{class:'ComputationalData', container:'MetaLevel', relationship:'Has'}
		]
	},
	{
		class:'CognitiveTask',
		generate:[
			{class:'ComputationalStrategy', container:'ObjectLevel', relationship:'Has'},
			{class:'Goal', container:'ObjectLevel', relationship:'Has'}
		]
	}
];

var relationshipRules = [
	{class:'FailureExplanation', endpoint:'Explanation', relationship:'Generates'},
	{class:'ProfileGeneration', endpoint:'Profile', relationship:'Generates'},
	{class:'CognitiveTask', endpoint:'ComputationalData', relationship:'Generates'},
	{class:'GoalGeneration', endpoint:'Explanation', relationship:'Reads'},
	{class:'FailureExplanation', endpoint:'ReasoningTrace', relationship:'Reads'},
	{class:'FailureDetection', endpoint:'Sensor', relationship:'Reads'},
	{class:'ProfileGeneration', endpoint:'ComputationalData', relationship:'Reads'},
	{class:'ReasoningFailure', endpoint:'Explanation', relationship:'Has'},
	{class:'ReasoningTask', endpoint:'ReasoningFailure', relationship:'Has'},
	{class:'ReasoningTask', endpoint:'Strategy', relationship:'Uses'},
	{class:'ReasoningTask', endpoint:'ComputationalStrategy', relationship:'Uses'},
	{class:'ReasoningTrace', endpoint:'ComputationalData', relationship:'Has'},
	{class:'FailureSolutionPlan', endpoint:'ControlTask', relationship:'Has'},
	{class:'CognitiveTask', endpoint:'ComputationalStrategy', relationship:'Has'},
	{class:'PlanConfiguration', endpoint:'FailureSolutionPlan', relationship:'InsertTask'},
	{class:'ReasoningFailure', endpoint:'ControlActivation', relationship:'Enables'},
	{class:'ControlActivation', endpoint:'PlanExecution', relationship:'Starts'},
	{class:'PlanExecution', endpoint:'FailureSolutionPlan', relationship:'Reads'},
	{class:'ControlTask', endpoint:'Profile', relationship:'Reads'},
	{class:'ControlTask', endpoint:'Explanation', relationship:'Reads'},
	{class:'StrategySelection', endpoint:'Goal', relationship:'Reads'},
	{class:'StrategySelection', endpoint:'Profile', relationship:'Reads'},
	{class:'StrategySelection', endpoint:'ComputationalStrategy', relationship:'Recommends'},
	{class:'CostCalculation', endpoint:'Profile', relationship:'Reads'},
	{class:'StrategySelection', endpoint:'CostCalculation', relationship:'Uses'},
	{class:'Strategy', endpoint:'Profile', relationship:'Has'},
	{class:'ComputationalStrategy', endpoint:'Profile', relationship:'Has'}
];

var common = {
	metalevel_element: function(){
		return {
			init: function(){
				var dragOptions = {
					changeZindex:true,
					move:function(){
						// Avoid leaving out the parent.
						(this.x < 0)? this.x = 0: false;
						(this.y < 0)? this.y = 0: false;
						(this.x > (this.parent.width - this.width))? this.x = this.parent.width - this.width: false;
						(this.y > (this.parent.height - this.height))? this.y = this.parent.height - this.height: false;

						// Update the properties on the bar.
						if(this.updateProperties){
							this.updateProperties({
								x: parseInt(this.x),
								y: parseInt(this.y)
							});
						}
					},
					bubble:false
				};
				this.dragAndDrop(dragOptions);

				this.class_label = this.core.display.text({
					x: 4,
					y: 5,
					origin: {x:'left', y:'top'},
					align: 'center',
					font: 'bold 12px Arial',
					text: '<<'+this.class+'>>',
					fill: '#fff'
				});
				this.addChild(this.class_label);

				this.label = this.core.display.text({
					x: 4,
					y: 27,
					origin: {x:'left', y:'top'},
					align: 'center',
					font: '12px Arial',
					text: this.class,
					fill: '#fff'
				});
				this.addChild(this.label);

				// Catch fous event.
				this.bind('click tap', function(event){
					event.stopPropagation();

					if(this.setFocusedObject){
						this.setFocusedObject(this);
					}

					// Update the properties on the bar.
					if(this.updateProperties){
						this.updateProperties({
							x: parseInt(this.x),
							y: parseInt(this.y),
							width: parseInt(this.width),
							height: parseInt(this.height),
							label: this.label.text,
							class: this.class
						});
					}

					// Check to add new object.
					if(this.getToolSelected){
						var ts = this.getToolSelected();
						if(ts != null && this.drawLine){
							this.drawLine(this);
						}
					}
				});
			},
			draw: function(){
				(this.width === 0)? this.width = this.defaultWidth: false;
				(this.height === 0)? this.height = this.defaultHeight: false;

				this.stroke = '2px #000';
				var canvas = this.core.canvas,
					origin = this.getOrigin(),
					x = this.abs_x - origin.x,
					y = this.abs_y - origin.y,
					width = this.width;
					height = this.height;
				canvas.beginPath();

				canvas.moveTo(0, 23);
				canvas.lineTo(this.width, 23);
				canvas.stroke();

				this.fill = '#FF7979';
				this.stroke = '2px #000';
				
				if(this.fill !== ''){
					canvas.fillStyle = this.fill;
					canvas.roundedRect(canvas, x, y, width, height, 7);
					canvas.fill()
				}
				
				if(this.strokeWidth > 0){
					canvas.strokeStyle = this.strokeColor;
					canvas.lineWidth = this.strokeWidth;
					canvas.stroke();
				}
				canvas.closePath();
				
				// Update lines positions.
				if(this.lines.length > 0){
					/*for(var i in this.lines){
						if(this.lines[i].line.parent == undefined){
							this.lines.splice(this.lines[i], 1);
						}
					}*/
					for(var i in this.lines){
						if(this.lines[i].line != null && this.lines[i].line.env == 'l'){
							if(this.lines[i].observe == 'start'){
								this.lines[i].line.x = this.x + (this.width / 2);
								this.lines[i].line.y = this.y + (this.height / 2);
							}else{
								this.lines[i].line.width = (this.x - this.lines[i].line.x) + (this.width / 2);
								this.lines[i].line.height = (this.y - this.lines[i].line.y) + (this.height / 2);
							}
							this.lines[i].line.line.start = {x:0, y:0}
							this.lines[i].line.line.end = {x:this.lines[i].line.width, y:this.lines[i].line.height}
							this.lines[i].line.label.x = (this.lines[i].line.width / 2);
							this.lines[i].line.label.y = (this.lines[i].line.height / 2) - 10;
						}else{
							if(this.lines[i].line != null){
								if(this.lines[i].observe == 'start'){
									this.lines[i].line.x = this.parent.x + this.x + 3;
									this.lines[i].line.y = this.parent.y + this.y;
								}else{
									this.lines[i].line.width = ((this.parent.x + this.x + 3) - this.lines[i].line.x);
									this.lines[i].line.height = ((this.parent.y + this.y) - this.lines[i].line.y);
								}
								this.lines[i].line.line.start = {x:0, y:0}
								this.lines[i].line.line.end = {x:this.lines[i].line.width, y:this.lines[i].line.height}
								this.lines[i].line.label.x = (this.lines[i].line.width / 2);
								this.lines[i].line.label.y = (this.lines[i].line.height / 2) - 10;
							}else{
								this.lines.splice(this.lines[i], 1);
							}
						}
					}
				}
			},
			setText: function(value){
				if(value != ''){
					this.label.text = value;
				}
			},
			setWidth: function(value){
				if(this.widthEditable && value < (this.parent.width) && value < (this.parent.width - this.width)){
					this.width = value;
				}else{
					console.log('valor no permitido');
				}
			},
			setHeight: function(value){
				if(this.heightEditable && value < (this.parent.height) && value < (this.parent.height - this.height)){
					this.height = value;
				}else{
					console.log('valor no permitido');
				}
			}
		}
	},
	objectlevel_element: function(){
		return {
			init: function(){
				var dragOptions = {
					changeZindex:true,
					move:function(){
						// Avoid leaving out the parent.
						(this.x < 0)? this.x = 0: false;
						(this.y < 0)? this.y = 0: false;
						(this.x > (this.parent.width - this.width))? this.x = this.parent.width - this.width: false;
						(this.y > (this.parent.height - this.height))? this.y = this.parent.height - this.height: false;

						// Update the properties on the bar.
						if(this.updateProperties){
							this.updateProperties({
								x: parseInt(this.x),
								y: parseInt(this.y)
							});
						}
					},
					bubble:false
				};
				this.dragAndDrop(dragOptions);

				this.class_label = this.core.display.text({
					x: 4,
					y: 5,
					origin: {x:'left', y:'top'},
					align: 'center',
					font: 'bold 12px Arial',
					text: '<<'+this.class+'>>',
					fill: '#fff'
				});
				this.addChild(this.class_label);

				this.label = this.core.display.text({
					x: 4,
					y: 27,
					origin: {x:'left', y:'top'},
					align: 'center',
					font: '12px Arial',
					text: this.class,
					fill: '#fff'
				});
				this.addChild(this.label);

				// Catch fous event.
				this.bind('click tap', function(event){
					event.stopPropagation();
					if(this.setFocusedObject){
						this.setFocusedObject(this);
					}

					// Update the properties on the bar.
					if(this.updateProperties){
						this.updateProperties({
							x: parseInt(this.x),
							y: parseInt(this.y),
							width: parseInt(this.width),
							height: parseInt(this.height),
							label: this.label.text,
							class: this.class
						});
					}

					// Check to add new object.
					if(this.getToolSelected){
						var ts = this.getToolSelected();
						if(ts != null && this.drawLine){
							this.drawLine(this);
						}
					}
				});
			},
			draw: function(){
				(this.width == 0)? this.width = this.defaultWidth: false;
				(this.height == 0)? this.height = this.defaultHeight: false;

				this.stroke = '2px #000';
				var canvas = this.core.canvas,
					origin = this.getOrigin(),
					x = this.abs_x - origin.x,
					y = this.abs_y - origin.y,
					width = this.width;
					height = this.height;
				canvas.beginPath();

				canvas.moveTo(0, 23);
				canvas.lineTo(this.width, 23);
				canvas.stroke();

				this.fill = '#1ABC9C';
				this.stroke = '2px #000';
				
				if(this.fill !== ''){
					canvas.fillStyle = this.fill;
					canvas.roundedRect(canvas, x, y, width, height, 7);
					canvas.fill()
				}
				
				if(this.strokeWidth > 0){
					canvas.strokeStyle = this.strokeColor;
					canvas.lineWidth = this.strokeWidth;
					canvas.stroke();
				}
				canvas.closePath();
				
				// Update lines positions.
				if(this.lines.length > 0){
					/*for(var i in this.lines){
						if(this.lines[i].line.parent == undefined){
							this.lines.splice(this.lines[i], 1);
						}
					}*/
					for(var i in this.lines){
						if(this.lines[i].line != null && this.lines[i].line.env == 'l'){
							if(this.lines[i].observe == 'start'){
								this.lines[i].line.x = this.x + (this.width / 2);
								this.lines[i].line.y = this.y + (this.height / 2);
							}else{
								this.lines[i].line.width = (this.x - this.lines[i].line.x) + (this.width / 2);
								this.lines[i].line.height = (this.y - this.lines[i].line.y) + (this.height / 2);
							}
							this.lines[i].line.line.start = {x:0, y:0}
							this.lines[i].line.line.end = {x:this.lines[i].line.width, y:this.lines[i].line.height}
							this.lines[i].line.label.x = (this.lines[i].line.width / 2);
							this.lines[i].line.label.y = (this.lines[i].line.height / 2)-10;
						}else{
							if(this.lines[i].line != null){
								if(this.lines[i].observe == 'start'){
									this.lines[i].line.x = this.parent.x + this.x + 3;
									this.lines[i].line.y = this.parent.y + this.y;
								}else{
									this.lines[i].line.width = ((this.parent.x + this.x + 3) - this.lines[i].line.x);
									this.lines[i].line.height = ((this.parent.y + this.y) - this.lines[i].line.y);
								}
								this.lines[i].line.line.start = {x:0, y:0}
								this.lines[i].line.line.end = {x:this.lines[i].line.width, y:this.lines[i].line.height}
								this.lines[i].line.label.x = (this.lines[i].line.width / 2);
								this.lines[i].line.label.y = (this.lines[i].line.height / 2)-10;
							}else {
								this.lines.splice(this.lines[i], 1);
							}
						}
					}
				}
			},
			setText: function(value){
				if(value != ''){
					this.label.text = value;
				}
			},
			setWidth: function(value){
				if(this.widthEditable && value < (this.parent.width) && value < (this.parent.width - this.width)){
					this.width = value;
				}else{
					console.log('valor no permitido');
				}
			},
			setHeight: function(value){
				if(this.heightEditable && value < (this.parent.height) && value < (this.parent.height - this.height)){
					this.height = value;
				}else{
					console.log('valor no permitido');
				}
			}
		}
	},
	relationship: function(){
		return {
			init: function(){
				this.line = this.core.display.line({
					start:{x:0, y:0},
					end:{x:0, y:0},
					stroke: "1px #000",
					cap: "round"
				});
				this.addChild(this.line);

				this.label = this.core.display.text({
					text: this.class,
					fill: '#000',
					origin: {x:'center', y:'center'},
					font: "12px Arial"
				});
				this.addChild(this.label);

				// Catch fous event.
				this.bind('click tap', function(event){
					event.stopPropagation();
					if(this.setFocusedObject){
						this.setFocusedObject(this);
					}

					// Update the properties on the bar.
					if(this.updateProperties){
						this.updateProperties({
							x: '',
							y: '',
							width: '',
							height: '',
							label: this.label.text,
							class: this.class
						});
					}
				});
			},
			draw: function(){
				var canvas = this.core.canvas,
					origin = this.getOrigin(),
					x = this.abs_x - origin.x,
					y = this.abs_y - origin.y,
					width = this.width,
					height = this.height;
					
				/*canvas.beginPath();
				canvas.fillStyle = 'rgba(100, 100, 100, 0.2)';
				canvas.fillRect(x, y, width, height);
				canvas.closePath();*/
			},
			setText: function(value){
				if(value != ''){
					this.label.text = value;
				}
			}
		}
	},
	container: function(){
		return {
			init: function(){
				var dragOptions = {
					changeZindex:false,
					move:function(){
						// Avoid leaving out the canvas.
						(this.x < 0)? this.x = 0: false;
						(this.y < 0)? this.y = 0: false;
						(this.x > (this.parent.width - this.width))? this.x = this.parent.width - this.width: false;
						(this.y > (this.parent.height - this.height))? this.y = this.parent.height - this.height: false;

						// Update the properties on the bar.
						if(this.updateProperties){
							this.updateProperties({
								x: parseInt(this.x),
								y: parseInt(this.y)
							});
						}
					},
					bubble:false
				};
				this.dragAndDrop(dragOptions);

				this.class_label = this.core.display.text({
					x: 4,
					y: 5,
					origin: {x:'left', y:'top'},
					align: 'center',
					font: 'bold 14px Arial',
					text: '<<'+this.class+'>>',
					fill: '#aaa'
				});
				this.addChild(this.class_label);

				this.label = this.core.display.text({
					x: this.class_label.x + this.class_label.width + 5,
					y: 5,
					origin: {x:'left', y:'top'},
					align: 'center',
					font: '14px Arial',
					text: this.class,
					fill: '#000'
				});
				this.addChild(this.label);

				// Catch focus event.
				this.bind('click tap', function(event){
					event.stopPropagation();
					if(this.setFocusedObject){
						this.setFocusedObject(this);
					}

					// Update the properties on the bar.
					if(this.updateProperties){
						this.updateProperties({
							x: parseInt(this.x),
							y: parseInt(this.y),
							width: parseInt(this.width),
							height: parseInt(this.height),
							label: this.label.text,
							class: this.class
						});
					}

					// Check to add new object.
					if(this.getToolSelected && this.getToolSelected() != null){
						var found = false;
						var i = 0;
						var c = this.getToolSelected();
						while(!found && i < this.nestingRules.children.length){
							if(this.nestingRules.children[i].class === c){
								found = true;
							}
							i += 1;
						}
						if(found && this.addNewChild){
							this.addNewChild(this, c);
						}else{
							console.log('can not create a new instance.');
						}
					}
				});
			},
			draw:function(){
				this.fill = '#eee';
				this.stroke = '2px #bdc7d8';
				
				(this.width == 0)? this.width = this.defaultWidth: false;
				(this.height == 0)? this.height = this.defaultHeight: false;

				var canvas = this.core.canvas,
					origin = this.getOrigin(),
					x = this.abs_x - origin.x,
					y = this.abs_y - origin.y,
					width = this.width;
					height = this.height;
				canvas.beginPath();
				
				if(this.fill !== ''){
					canvas.fillStyle = this.fill;
					canvas.fillRect(x, y, width, height);
					canvas.setLineDash([5]);
				}
				
				if(this.strokeWidth > 0){
					canvas.strokeStyle = this.strokeColor;
					canvas.lineWidth = this.strokeWidth;
					canvas.strokeRect(x, y, width, height);
				}
				canvas.closePath();
			},
			setText: function(value){
				if(value != ''){
					this.label.text = value;
				}
			},
			setWidth: function(value){
				if(this.widthEditable && value < (this.parent.width) && value < (this.parent.width - this.width)){
					this.width = value;
				}else{
					console.log('valor no permitido');
				}
			},
			setHeight: function(value){
				if(this.heightEditable && value < (this.parent.height) && value < (this.parent.height - this.height)){
					this.height = value;
				}else{
					console.log('valor no permitido');
				}
			}
		}
	}
}

// Containers.
var MetaLevel = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'MetaLevel',
		widthEditable: true,
		heightEditable: true,
		defaultWidth: 600,
		defaultHeight: 200,
		shapeType: 'rectangular',
		nestingRules: nestingRules.metaLevel
	}, settings, common.container());
};
oCanvas.registerDisplayObject('MetaLevel', MetaLevel, 'init');

var ObjectLevel = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'ObjectLevel',
		widthEditable: true,
		heightEditable: true,
		defaultWidth: 600,
		defaultHeight: 200,
		shapeType: 'rectangular',
		nestingRules: nestingRules.objectLevel
	}, settings, common.container());
};
oCanvas.registerDisplayObject('ObjectLevel', ObjectLevel, 'init');

// Elements (MetaLevel).
var Sensor = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'Sensor',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 100,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.metalevel_element());
};
oCanvas.registerDisplayObject('Sensor', Sensor, 'init');

var Profile = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'Profile',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 100,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.metalevel_element());
};
oCanvas.registerDisplayObject('Profile', Profile, 'init');

var Explanation = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'Explanation',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 130,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.metalevel_element());
};
oCanvas.registerDisplayObject('Explanation', Explanation, 'init');

var ReasoningFailure = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'ReasoningFailure',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 140,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.metalevel_element());
};
oCanvas.registerDisplayObject('ReasoningFailure', ReasoningFailure, 'init');

var Goal = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'Goal',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 100,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.metalevel_element());
};
oCanvas.registerDisplayObject('Goal', Goal, 'init');

var FailureSolutionPlan = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'FailureSolutionPlan',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 150,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.metalevel_element());
};
oCanvas.registerDisplayObject('FailureSolutionPlan', FailureSolutionPlan, 'init');

var ReasoningPlan = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'ReasoningPlan',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 150,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.metalevel_element());
};
oCanvas.registerDisplayObject('ReasoningPlan', ReasoningPlan, 'init');

var MonitoringTask = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'MonitoringTask',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 130,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.metalevel_element());
};
oCanvas.registerDisplayObject('MonitoringTask', MonitoringTask, 'init');

var GoalGeneration = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'GoalGeneration',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 130,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.metalevel_element());
};
oCanvas.registerDisplayObject('GoalGeneration', GoalGeneration, 'init');

var FailureExplanation = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'FailureExplanation',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 150,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.metalevel_element());
};
oCanvas.registerDisplayObject('FailureExplanation', FailureExplanation, 'init');

var FailureDetection = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'FailureDetection',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 130,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.metalevel_element());
};
oCanvas.registerDisplayObject('FailureDetection', FailureDetection, 'init');

var ProfileGeneration = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'ProfileGeneration',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 150,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.metalevel_element());
};
oCanvas.registerDisplayObject('ProfileGeneration', ProfileGeneration, 'init');

var ControlTask = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'ControlTask',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 130,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.metalevel_element());
};
oCanvas.registerDisplayObject('ControlTask', ControlTask, 'init');

var PlanConfiguration = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'PlanConfiguration',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 150,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.metalevel_element());
};
oCanvas.registerDisplayObject('PlanConfiguration', PlanConfiguration, 'init');

var ControlActivation = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'ControlActivation',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 150,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.metalevel_element());
};
oCanvas.registerDisplayObject('ControlActivation', ControlActivation, 'init');

var PlanExecution = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'PlanExecution',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 130,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.metalevel_element());
};
oCanvas.registerDisplayObject('PlanExecution', PlanExecution, 'init');

var StrategySelection = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'StrategySelection',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 150,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.metalevel_element());
};
oCanvas.registerDisplayObject('StrategySelection', StrategySelection, 'init');

// Elements (ObjectLevel).
var ComputationalData = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'ComputationalData',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 150,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.objectlevel_element());
};
oCanvas.registerDisplayObject('ComputationalData', ComputationalData, 'init');

var ReasoningTrace = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'ReasoningTrace',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 130,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.objectlevel_element());
};
oCanvas.registerDisplayObject('ReasoningTrace', ReasoningTrace, 'init');

var Strategy = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'Strategy',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 130,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.objectlevel_element());
};
oCanvas.registerDisplayObject('Strategy', Strategy, 'init');

var ComputationalStrategy = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'ComputationalStrategy',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 180,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.objectlevel_element());
};
oCanvas.registerDisplayObject('ComputationalStrategy', ComputationalStrategy, 'init');

var CognitiveTask = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'CognitiveTask',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 130,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.objectlevel_element());
};
oCanvas.registerDisplayObject('CognitiveTask', CognitiveTask, 'init');

var ReasoningTask = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'ReasoningTask',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 130,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.objectlevel_element());
};
oCanvas.registerDisplayObject('ReasoningTask', ReasoningTask, 'init');

var CostCalculation = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'CostCalculation',
		widthEditable: true,
		heightEditable: false,
		defaultWidth: 130,
		defaultHeight: 80,
		shapeType: 'rectangular',
		lines:[],
		relationshipRules: relationshipRules
	}, settings, common.objectlevel_element());
};
oCanvas.registerDisplayObject('CostCalculation', CostCalculation, 'init');

// Relationships
var Generates = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'Generates',
		shapeType: 'radial'
	}, settings, common.relationship());
};
oCanvas.registerDisplayObject('Generates', Generates, 'init');

var Has = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'Has',
		shapeType: 'radial'
	}, settings, common.relationship());
};
oCanvas.registerDisplayObject('Has', Has, 'init');

var Detects = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'Detects',
		shapeType: 'radial'
	}, settings, common.relationship());
};
oCanvas.registerDisplayObject('Detects', Detects, 'init');

var Reads = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'Reads',
		shapeType: 'radial'
	}, settings, common.relationship());
};
oCanvas.registerDisplayObject('Reads', Reads, 'init');

var Enables = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'Enables',
		shapeType: 'radial'
	}, settings, common.relationship());
};
oCanvas.registerDisplayObject('Enables', Enables, 'init');

var Uses = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'Uses',
		shapeType: 'radial'
	}, settings, common.relationship());
};
oCanvas.registerDisplayObject('Uses', Uses, 'init');

var Recommends = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'Recommends',
		shapeType: 'radial'
	}, settings, common.relationship());
};
oCanvas.registerDisplayObject('Recommends', Recommends, 'init');

var Starts = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'Starts',
		shapeType: 'radial'
	}, settings, common.relationship());
};
oCanvas.registerDisplayObject('Starts', Starts, 'init');

var InsertTask = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'InsertTask',
		shapeType: 'radial'
	}, settings, common.relationship());
};
oCanvas.registerDisplayObject('InsertTask', InsertTask, 'init');

var Monitors = function(settings, core){

	return oCanvas.extend({
		core: core,
		class: 'Monitors',
		shapeType: 'radial'
	}, settings, common.relationship());
};
oCanvas.registerDisplayObject('Monitors', Monitors, 'init');