import React, {Component} from 'react'
import $ from 'jquery'
import Form from '../Form'
import Button from '../Button'
import DialogBox from '../DialogBox'
import commands from '../../commands'

export default class CopyCard extends Component {
  constructor(props){
    super(props)
    this.state = {
      boards: null, // loads via ajax upon mount
      boardId: this.props.board.id,
      listId: this.props.card.list_id,
      title: this.props.card.content,
      order: this.props.card.order,
    }
    this.selectPositionHandler = this.selectPositionHandler.bind(this)
    this.copyCardHandler = this.copyCardHandler.bind(this)
    this.selectListHandler = this.selectListHandler.bind(this)
    this.selectBoardHandler = this.selectBoardHandler.bind(this)
    this.textAreaHandler = this.textAreaHandler.bind(this)

    this.loadListsForAllBoards()
  }

  loadListsForAllBoards(){
    $.getJSON('/api/boards/move-targets').then(boards => {
      this.setState({boards})
    })
  }

  copyCardHandler(event){
    event.preventDefault()
    if (this.state.title.replace(/\s+/g,'') === '') return
    commands.createCard(this.state.boardId, this.state.listId, {
      content: this.state.title,
      order: this.state.order
    })
      .then(this.props.onClose)
  }

  selectBoardHandler(event){
    const boardId = parseInt(event.target.value)
    const board = this.state.boards.find(board => board.id === boardId)
    const listId = board.id == this.props.board.id ? this.props.list.id : board.lists[0].id
    const list = board.lists.find(list => list.id === listId)
    const order = board.id == this.props.board.id ? this.props.card.order : list.card_count
    this.setState({
      boardId,
      listId,
      order
    })
  }

  selectListHandler(event){
    const board = this.state.boards.find(board => board.id === this.state.boardId)
    const listId = parseInt(event.target.value)
    const list = board.lists.find(list => list.id === listId)
    const order = list.id == this.props.list.id ? this.props.card.order : list.card_count
    this.setState({
      listId,
      order
    })
  }

  selectPositionHandler(event){
    const order = parseInt(event.target.value)
    this.setState({order})
  }

  textAreaHandler(event){
    this.setState({title: event.target.value})
  }

  buildBoardOptions(){
    return this.state.boards
      .map(board =>
        <option key={board.id} value={board.id}>
          {board.name}
          {board.id == this.props.board.id ? ' (current)' : ''}
        </option>
      )
  }

  buildListOptions(lists){
    return lists
      .map(list =>
        <option key={list.id} value={list.id}>
          {list.name}
          {list.id == this.props.card.list_id ? ' (current)' : ''}
        </option>
      )
  }

  buildPositionOptions(list){
    const positions = []
    for (let i = 0; i < list.card_count + 1; i++) {
      positions.push(i)
    }
    return positions.map(position => {
      let current
      if (list.id == this.props.list.id) {
        current = position == this.props.card.order ? ' (current)' : ''
      }
      return <option key={position} value={position}>
        {position + 1 }
        {current}
      </option>
     }
    )
  }

  getBoard(){
    return this.state.boards.find(board => board.id === this.state.boardId)
  }

  getList(){
    return this.getBoard().lists.find(list => list.id === this.state.listId)
  }

  render(){
    if (this.state.boards === null){
      return <DialogBox className="CardModal-CopyCardDialog" heading='Copy Card' onClose={this.props.onClose}>
        Loading…
      </DialogBox>
    }

    const selectedBoard = this.getBoard()
    const selectedList = this.getList()

    const boardsList = this.buildBoardOptions()
    const listsList = this.buildListOptions(selectedBoard.lists)
    const positionList = this.buildPositionOptions(selectedList)

    const boardSelector =
      <div className='CardModal-CopyCardDialog-SelectContainer'>
        <label className='CardModal-CopyCardDialog-SelectContainer-Label'> Board </label>
        <span>{selectedBoard.name}</span>
        <select onChange={this.selectBoardHandler} value={selectedBoard.id}>{boardsList}</select>
      </div>

    const listSelector =
      <div className='CardModal-CopyCardDialog-SelectContainer'>
        <label className='CardModal-CopyCardDialog-SelectContainer-Label'> List </label>
        <span>{selectedList.name}</span>
        <select onChange={this.selectListHandler} value={selectedList.id}>{listsList}</select>
      </div>

    const positionSelector =
      <div className='CardModal-CopyCardDialog-SelectContainer'>
        <label className='CardModal-CopyCardDialog-SelectContainer-Label'> Position </label>
        <span>{this.state.order + 1}</span>
        <select onChange={this.selectPositionHandler} value={this.state.order}>{positionList}</select>
      </div>

    return <DialogBox className="CardModal-CopyCardDialog" heading='Copy Card' onClose={this.props.onClose}>
      <Form onSubmit={this.copyCardHandler}>
        <label>Title</label>
        <textarea
          value={this.state.title}
          onChange={this.textAreaHandler}
        />
        <p> Copy to ...</p>
        {boardSelector}
        <div className='CardModal-CopyCardDialog-Wrapper'>
        {listSelector}
        {positionSelector}
        </div>
        <Button type="primary" submit>Create Card</Button>
      </Form>
    </DialogBox>
  }
}
