/* eslint-disable no-unused-vars */
import React, { Fragment, useMemo, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { ButtonGroup, Button, ToggleButton, Card, Col, Container, Row, Image, Badge, Form, Modal } from 'react-bootstrap'
import { Link, useParams } from 'react-router-dom'
import Loader from '../components/Loader'
import Message from '../components/Message'
import ListSpecialQuestionCall from '../ReduxHooks/ListSpecialQuestionCall'

const ProductInspection = ({ history }) => {
  const { id } = useParams()
  const dispatch = useDispatch()

  const [questionInUse, setQuestionInUse] = useState('')
  const [radioValue, setRadioValue] = useState('0')
  const [modalShow, setModalShow] = React.useState(false)

  const orderInit = useSelector((state) => state.orderInit)
  const { order } = orderInit

  const specialQuestionList = useSelector((state) => state.specialQuestionList)
  const { error: specialQuestError, loading: specialQuestLoading, questions: specialQuestions } = specialQuestionList
  const deviceReport = localStorage.getItem('deviceReport') ? JSON.parse(localStorage.getItem('deviceReport')) : []
  const [data, setData] = useState(deviceReport)
  const [childData, setChildData] = useState([])

  const submitHandler = () => {
    history.push(`/init/${id}/accessories-and-warranty`)
  }

  function modalHandler(question) {
    // trigors if user hits No
    setQuestionInUse(question) // dont change this
    setChildData([])

    const hasParentId = data.find(({ parentId }) => question.id === parentId)
    const indexOfQuestion = data.indexOf(hasParentId)

    if (!hasParentId) {
      setData((data) => data.concat({ question: question.if_no, parentId: question.id, userChoice: 'NO', child: [] }))
    } else {
      data[indexOfQuestion] = { question: question.if_no, parentId: question.id, userChoice: 'NO', child: [] }
    }
    localStorage.setItem('deviceReport', JSON.stringify(data))

    setModalShow(true)
  }

  const handleClickYes = (question) => {
    // find if question is in the data array
    const hasQuestion = data.find(({ parentId }) => question.id === parentId)
    const indexOfQuestion = data.indexOf(hasQuestion)

    // copy data to mutable object
    let newData = [...data]
    if (hasQuestion) {
      // update the value with specific selected index in the array.
      newData[indexOfQuestion] = {
        question: question.if_yes,
        parentId: question.id,
        userChoice: 'YES',
        child: []
      }
    } else {
      //   concat existing data with a new question
      newData = [
        ...newData,
        {
          question: question.if_yes,
          parentId: question.id,
          userChoice: 'YES',
          child: []
        }
      ]
    }
    localStorage.setItem('deviceReport', JSON.stringify(newData))
    setData(newData)
  }

  function subQuestionsHandler(sub, questionId) {
    // const hasId = data.child.some(({ id }) => sub.id === id)
    const id = sub.id
    const sub_question = sub.sub_question
    const weightage = sub.weightage
    // console.log(id, sub_question, weightage)

    const hasId = childData.find(({ id }) => sub.id === id)
    // copy data to mutable object

    if (!hasId) {
      let newData = [...childData]
      newData = [...newData, { id: id, sub_question: sub_question, weightage: weightage }]
      setChildData(newData)
    }
    //  find parent of the child
    const parent = data.find(({ parentId }) => questionId === parentId)
    // find index of parent
    const indexOfParent = data.indexOf(parent)
    // update data with child related to parent
    let newData = [...data]
    newData[indexOfParent].child = childData
    setData(newData)
    localStorage.setItem('deviceReport', JSON.stringify(newData))
  }

  function SubQuestionModal(props) {
    return (
      <Fragment>
        <Modal {...props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
          <Modal.Header closeButton>
            <Modal.Title id="contained-modal-title-vcenter">Please Tell us more </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row xs={3} md={3} className="g-3">
              {questionInUse.specialsubquestion ? (
                questionInUse.specialsubquestion.map((sub) => (
                  <Col>
                    <ToggleButton
                      variant="outline-primary"
                      className="mx-0"
                      id={sub.radio_id_1}
                      type="button"
                      // border="primary"
                      style={{ width: '13rem', height: '18rem' }}
                      key={sub.id}
                      onClick={(e) => subQuestionsHandler(sub, questionInUse.id)}
                    >
                      <Card.Img
                        variant="top"
                        style={{
                          width: '11rem',
                          height: 'auto'
                        }}
                        className="mb-2 my-2 p-2 mr-2"
                        src={sub.image}
                      />
                      {sub.sub_question}
                    </ToggleButton>
                  </Col>
                ))
              ) : (
                <Message variant="dnager"> No Sub Question was added </Message>
              )}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={props.onHide}>Close</Button>
          </Modal.Footer>
        </Modal>
      </Fragment>
    )
  }

  return (
    <Container>
      <ListSpecialQuestionCall />
      <Row>
        <Col md={8}>
          <Card style={{ minHeight: '40rem' }}>
            <Card.Header>
              <h5 className="px-2"> Tell us a few things about your device!</h5>
            </Card.Header>

            <Card.Body>
              {specialQuestLoading ? (
                <Loader></Loader>
              ) : specialQuestError ? (
                <Message color="danger"> {specialQuestError} </Message>
              ) : (
                <>
                  {specialQuestions
                    ? specialQuestions.map((question) => (
                        <div className="py-2 my-2" key={question.id}>
                          {question.question_cat === order.prod_category ? (
                            <>
                              <Card.Title className="py-2 px-2"> {question.question}</Card.Title>
                              <Row>
                                <>
                                  <ButtonGroup className="mb-2">
                                    <ToggleButton
                                      className="py-2 mx-2"
                                      key={question.radio_id_1}
                                      id={question.radio_id_1}
                                      type="checkbox"
                                      variant="outline-primary"
                                      name="radio"
                                      value={question.radio_id_1}
                                      checked={radioValue === question.radio_id_1}
                                      onChange={(e) => handleClickYes(question)}
                                    >
                                      YES
                                    </ToggleButton>

                                    <ToggleButton
                                      className="py-2 mx-2"
                                      key={question.radio_id_2}
                                      id={question.radio_id_2}
                                      type="checkbox"
                                      variant="outline-danger"
                                      name="radio"
                                      value={question.radio_id_2}
                                      checked={radioValue === question.radio_id_2}
                                      onChange={() => modalHandler(question)}
                                    >
                                      NO
                                    </ToggleButton>
                                  </ButtonGroup>
                                </>
                              </Row>
                            </>
                          ) : null}
                        </div>
                      ))
                    : null}
                </>
              )}

              <SubQuestionModal show={modalShow} onHide={() => setModalShow(false)} />

              <Form.Group className="mb-3"></Form.Group>
            </Card.Body>

            <Card.Footer>
              <Button variant="outline-danger" onClick={submitHandler} className="mx-1">
                {' '}
                Skip
              </Button>
              <Button variant="primary" onClick={submitHandler}>
                {' '}
                Continue
              </Button>
            </Card.Footer>
          </Card>
        </Col>
        <Col md={4}>
          <Card style={{ minHeight: '40rem' }}>
            <Row>
              <Col md={4}>
                <Image
                  style={{ width: '25rem', height: 'auto' }}
                  className="mb-2 my-2 p-2 mr-4"
                  src={order.prod_image}
                  alt={order.product}
                  fluid
                />
              </Col>
              <Col md={8}>
                {' '}
                <h5 classNames="py-2">
                  {' '}
                  <strong>{order.product}</strong>
                </h5>
                <hr /> <Badge bg="primary">Selected Variant : {order.variant}</Badge>
              </Col>
            </Row>

            <Card.Header>
              {' '}
              <Card.Title className="px-1 py-1">Device Evaluation</Card.Title>
            </Card.Header>

            <Card.Body>
              {deviceReport
                ? deviceReport.map((item) => (
                    <Card className="py-2 my-2" key={item.id}>
                      {item.length === 0 ? <Message variant="warning"> No question was anssered </Message> : null}
                      <Card.Header className="py-2 px-2"> {item.question} </Card.Header>
                      {item.child
                        ? item.child.map((child) => (
                            <Badge className="px-2 my-0" key={child.id} as="span" bg="light">
                              {' '}
                              {child.sub_question}
                            </Badge>
                          ))
                        : // <> {data.userChoice === 'NO' ? <li className="py-0 mx-2"> Subquestion was not selected</li> : null}</>
                          null}
                    </Card>
                  ))
                : null}
            </Card.Body>

            <Card.Footer></Card.Footer>
          </Card>
        </Col>
      </Row>
      <Row>
        <Col md={8}> </Col>
        <Col md={4}></Col>
      </Row>
    </Container>
  )
}

export default ProductInspection
