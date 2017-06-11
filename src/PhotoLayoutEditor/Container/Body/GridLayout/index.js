import React from 'react';
import { connect } from 'react-redux';
import ReactGridLayout from 'react-grid-layout';
import classNames from 'classnames';

import * as actions from '../../../actions';
import * as libs from '../../../lib';


let timeStamp = [];


class GridLayout extends React.Component {

	static displayName = 'GridLayout';

	static defaultProps = {
		tree: null,
		ple: null,
		dispatch: null,
	};

	constructor(props)
	{
		super(props);
	}

	/**
	 * On select block
	 *
	 * @param {Number} id
	 * @param {boolean} isImage
	 */
	_selectBlock(id, isImage)
	{
		const { props } = this;

		if (id === null)
		{
			props.dispatch(actions.body.activeBlock([], false));
			return;
		}

		switch(props.keyboard.keyName)
		{
			case 'CMD':
			case 'CTRL':
			case 'SHIFT':
				if (libs.object.isArray(props.tree.body.activeBlock))
				{
					let newActiveBlock = Object.assign([], props.tree.body.activeBlock);
					if (newActiveBlock.indexOf(id) > -1)
					{
						newActiveBlock.splice(newActiveBlock.indexOf(id), 1);
					}
					else
					{
						newActiveBlock.push(id);
					}
					props.dispatch(actions.body.activeBlock(newActiveBlock, isImage));
				}
				else
				{
					props.dispatch(actions.body.activeBlock([id], isImage));
				}
				break;

			default:
				props.dispatch(actions.body.activeBlock([id], isImage));
				break;
		}
	}

	/**
	 * On update blocks
	 *
	 * @param {String} type
	 * @param {Array} layout
	 */
	_updateBlocks(type, layout)
	{
		const { props } = this;

		switch(type)
		{
			case 'start':
				timeStamp[0] = new Date().getTime();
				break;

			case 'end':
				timeStamp[1] = new Date().getTime();
				if (timeStamp[1] - timeStamp[0] > 400)
				{
					let newGrid = props.tree.body.grid.map((o, k) => {
						return {
							...o,
							layout: {
								x: layout[k].x,
								y: layout[k].y,
								w: layout[k].w,
								h: layout[k].h,
							},
						};
					});
					props.dispatch(actions.body.updateBlocks(newGrid));
				}
				timeStamp = [];
				break;
		}
	}

	/**
	 * Render item
	 *
	 * @param {Object} item
	 * @param {Number} n
	 * @return {Component}
	 */
	renderItem(item, n)
	{
		const { props } = this;
		const { activeBlock } = props.tree.body;

		let key = `${item.indexPrefix}__${item.index}`;
		let active = !!(activeBlock && activeBlock.length && activeBlock.indexOf(item.index) > -1);

		return (
			<div
				key={key}
				data-grid={item.layout}
				data-index={item.index}
				onClick={(event) => {
					event.stopPropagation();
					this._selectBlock(item.index, !!item.image);
				}}
				style={{ backgroundColor: item.color || props.setting.body.blockColor }}
				className={classNames({ 'active': active })}>
				{item.image && (
					<figure
						style={{
							backgroundImage: `url('${item.image.src}')`,
							backgroundPosition: item.image.position,
							backgroundSize: item.image.size,
						}}/>
				)}
			</div>
		);
	}

	render()
	{
		const { props } = this;
		const { setting } = props.tree.body;
		const bodyWidth = (setting.width * setting.column) +
			(setting.innerMargin * (setting.column-1)) +
			(setting.outerMargin * 2);

		return (
			<div className="ple-grid__wrap" onClick={() => this._selectBlock(null)}>
				<ReactGridLayout
					autoSize={true}
					cols={setting.column}
					rowHeight={setting.height}
					width={bodyWidth}
					margin={[setting.innerMargin, setting.innerMargin]}
					containerPadding={[setting.outerMargin, setting.outerMargin]}
					verticalCompact={!setting.freeMode}
					onDragStart={() => this._updateBlocks('start', null)}
					onDragStop={(layout) => this._updateBlocks('end', layout)}
					onResizeStart={() => this._updateBlocks('start', null)}
					onResizeStop={(layout) => this._updateBlocks('end', layout)}
					style={{width: `${bodyWidth}px`}}
					className="ple-grid">
					{props.tree.body.grid.map(this.renderItem.bind(this))}
				</ReactGridLayout>
			</div>
		);
	}

}


export default connect((state) => Object.assign({}, state, {}))(GridLayout);