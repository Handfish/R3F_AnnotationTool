import Eye from '../icons-react/Eye';

export default function DraggableIcon() {

  return (
    <>
      <div style={{display: "block"}}>

        <div style={{float: "left"}} draggable={true}>
          <Eye className={'pointer'} width="72px" height="72px"/>
        </div>
        

        {/* <Eye style={{float: "left"}} className={'pointer'} width="72px" height="72px"/> */}

      </div>
    </>
  )
}
