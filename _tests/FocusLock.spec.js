/* eslint-disable jsx-a11y/no-autofocus, jsx-a11y/no-static-element-interactions */

import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import {expect} from 'chai';
import {mount} from 'enzyme';
import sinon from 'sinon'
import FocusLock, {AutoFocusInside} from '../src/index';

describe('react-focus-lock', () => {
  beforeEach(() => {
    sinon.stub(console, 'error').callsFake((message) => {
      throw new Error(message);
    });
  });

  afterEach(() => {
    console.error.restore();
  });

  describe('FocusTrap', () => {
  });

  describe('FocusLock', () => {
    let mountPoint;

    beforeEach(() => {
      mountPoint = document.createElement('div');
      document.body.appendChild(mountPoint);
    });

    afterEach(() => {
      ReactDOM.unmountComponentAtNode(mountPoint);
      document.body.removeChild(mountPoint);
      document.body.innerHTML = '';
      document.body.focus();
    });

    it('Is rendered', () => {
      mount(<FocusLock><p>children</p></FocusLock>)
    })

    it('Should not focus on inputs', () => {
      const wrapper = mount((
        <div>
          <div>
            text
            <button className="action1">action1</button>
            text
          </div>
          <div>
            text
            <button className="action2">1-action2</button>
            text
          </div>
        </div>
      ), mountPoint);
      wrapper.find('.action1').getDOMNode().focus();
      expect(document.activeElement.innerHTML).to.be.equal('action1');
      wrapper.find('.action2').getDOMNode().focus();
      expect(document.activeElement.innerHTML).to.be.equal('1-action2');
    });

    it('Should return focus to the original place', (done) => {
      class Test extends Component {
        state = {
          focused: true,
        };

        deactivate = () => {
          this.setState({
            focused: false,
          });
        };

        render() {
          return (
            <div className="clickTarget" onClick={this.deactivate}>
              {
                this.state.focused && <FocusLock returnFocus>
                  <div>
                    text
                    <button className="action2">d-action2</button>
                    text
                  </div>
                </FocusLock>
              }
            </div>
          );
        }
      }
      const wrapper = mount((
        <div>
          <div>
            text
            <button className="action1">d-action1</button>
            text
            <button className="action1" autoFocus>d-action3</button>
          </div>
          <Test />
        </div>
      ), mountPoint);
      expect(document.activeElement.innerHTML).to.be.equal('d-action2');
      wrapper.find('.clickTarget').simulate('click');
      setTimeout(() => {
        expect(document.activeElement.innerHTML).to.be.equal('d-action3');
        done();
      }, 1);
    });

    it('Should focus on inputs', (done) => {
      const wrapper = mount(<div>
        <div>
          text
          <button className="action1">action1</button>
          text
        </div>
        <FocusLock>
          <div>
            text
            <button className="action2-false" disabled>action2-false</button>
            <button className="action2">2-action2</button>
            text
          </div>
        </FocusLock>
      </div>, mountPoint);
      wrapper.find('.action1').getDOMNode().focus();
      expect(document.activeElement.innerHTML).to.be.equal('action1');
      setTimeout(() => {
        expect(document.activeElement.innerHTML).to.be.equal('2-action2');
        done();
      }, 10);
    });

    it('Should focus on autofocused element', (done) => {
      mount(<div>
        <div>
          text
          <button className="action1">action1</button>
          text
        </div>
        <FocusLock>
          <div>
            text
            <button className="action2-1">pre-action2</button>
            <button className="action2-2" autoFocus>action2</button>
            <button className="action2-3">post-action2</button>
            text
          </div>
        </FocusLock>
      </div>, mountPoint);
      // wrapper.find('.action1').getDOMNode().focus();
      // expect(document.activeElement.innerHTML).to.be.equal('action1');
      setTimeout(() => {
        expect(document.activeElement.innerHTML).to.be.equal('action2');
        done();
      }, 10);
    });

    describe('order', () => {
      it('Should be enabled only on last node', (done) => {
        const wrapper = mount(<div>
          <div>
            text
            <button className="action1">action1</button>
            text
          </div>
          <FocusLock>
            <div>
              text
              <button className="action2">3-action2</button>
              text
            </div>
          </FocusLock>
          <FocusLock>
            <div>
              text
              <button className="action3">action3</button>
              text
            </div>
          </FocusLock>
        </div>, mountPoint);
        wrapper.find('.action1').getDOMNode().focus();
        expect(document.activeElement.innerHTML).to.be.equal('action1');
        setImmediate(() => {
          expect(document.activeElement.innerHTML).to.be.equal('action3');
          done();
        });
      });

      it('Should handle disabled state', (done) => {
        const wrapper = mount(<div>
          <div>
            text
            <button className="action1">action1</button>
            text
          </div>
          <FocusLock>
            <div>
              text
              <button className="action2">4-action2</button>
              text
            </div>
          </FocusLock>
          <FocusLock disabled>
            <div>
              text
              <button className="action3">action3</button>
              text
            </div>
          </FocusLock>
        </div>, mountPoint);
        wrapper.find('.action1').getDOMNode().focus();
        expect(document.activeElement.innerHTML).to.be.equal('action1');
        setTimeout(() => {
          expect(document.activeElement.innerHTML).to.be.equal('4-action2');
          done();
        }, 1);
      });

      it('Should not pick hidden input', (done) => {
        const wrapper = mount(<div>
          <div>
            text
            <button className="action1">action1</button>
            text
          </div>
          <FocusLock>
            <input type="hidden" className="action2"/>
            <button style={{visibility: 'hidden'}}>hidden</button>
            <div style={{display: 'none'}}>
              <button className="action2">5-action3</button>
            </div>
            <button className="action2">5-action4</button>
          </FocusLock>
        </div>, mountPoint);
        wrapper.find('.action1').getDOMNode().focus();
        expect(document.activeElement.innerHTML).to.be.equal('action1');
        setTimeout(() => {
          expect(document.activeElement.innerHTML).to.be.equal('5-action4');
          done();
        }, 1);
      });

      it('Focuses the first element in the form', (done) => {
        const wrapper = mount((
          <div>
            <button className="action1">action1</button>
            <FocusLock>
              <div>
                <input type="text" name="first"/>
                <input type="text" name="second"/>
                <input type="text" name="third"/>
              </div>
            </FocusLock>
          </div>
        ), mountPoint);

        wrapper.find('.action1').getDOMNode().focus();
        expect(document.activeElement.innerHTML).to.be.equal('action1');
        setImmediate(() => {
          expect(document.activeElement.name).to.be.equal('first');
          done();
        });
      });

      it('Focuses on checked item within radio group', (done) => {
        const wrapper = mount((
          <div>
            <button className="action1">action1</button>
            <FocusLock>
              <div>
                <input name="group" type="radio" defaultValue="first"/>
                <input name="group" type="radio" defaultValue="second" defaultChecked/>
                <input name="group" type="radio" defaultValue="third"/>

                <input type="text" defaultValue="mistake"/>
              </div>
            </FocusLock>
          </div>
        ), mountPoint);
        wrapper.find('.action1').getDOMNode().focus();
        expect(document.activeElement.innerHTML).to.be.equal('action1');
        setImmediate(() => {
          expect(document.activeElement.value).to.be.equal('second');
          done();
        });
      });

      it.skip('Focuses on checked item within autoselected radio group', (done) => {
        const wrapper = mount((
          <div>
            <FocusLock>
              <div>
                <button className="action1">action1</button>
                <input name="group" type="radio" value="first" data-autofocus/>
                <input name="group" type="radio" value="second" data-autofocus defaultChecked/>
                <input name="group" type="radio" value="third" data-autofocus/>

                <input type="text" value="mistake"/>
              </div>
            </FocusLock>
          </div>
        ), mountPoint);
        wrapper.find('.action1').getDOMNode().focus();
        expect(document.activeElement.innerHTML).to.be.equal('action1');
        setImmediate(() => {
          expect(document.activeElement.value).to.be.equal('second');
          done();
        });
      });

      it.skip('Do the same with AutoFocusIncide', (done) => {
        const wrapper = mount((
          <div>
            <FocusLock>
              <div>
                <button className="action1">action1</button>
                <AutoFocusInside>
                  <input name="group" type="radio" value="first"/>
                  <input name="group" type="radio" value="second" defaultChecked/>
                  <input name="group" type="radio" value="third"/>
                </AutoFocusInside>

                <input type="text" value="mistake"/>
              </div>
            </FocusLock>
          </div>
        ), mountPoint);
        wrapper.find('.action1').getDOMNode().focus();
        expect(document.activeElement.innerHTML).to.be.equal('action1');
        setImmediate(() => {
          expect(document.activeElement.value).to.be.equal('second');
          done();
        });
      });
    });

    describe('move', () => {
      it('Should return focus on escape', (done) => {
        const wrapper = mount(<div>
          <div>
            text
            <button className="action1">action1</button>
            <button className="action1-1">action1-skip</button>
            <button className="action1-1">action1-skip-</button>
            text
          </div>
          <FocusLock>
            <button className="action2">button-action</button>
            <button>6-action3</button>
            <button>6-action4</button>
          </FocusLock>
        </div>, mountPoint);
        expect(document.activeElement.innerHTML).to.be.equal('button-action');
        setTimeout(() => {
          wrapper.find('.action1').simulate('focus');
          wrapper.find('.action1').getDOMNode().focus();
          expect(document.activeElement.innerHTML).to.be.equal('action1');
          wrapper.find('.action2').simulate('blur');
          setTimeout(() => {
            expect(document.activeElement.innerHTML).to.be.equal('button-action');
            done();
          }, 10);
        }, 1);
      });

      it('Should roll focus on escape', (done) => {
        const wrapper = mount(<div>
          <div>
            text
            <button className="action1">action1</button>
            text
          </div>
          <FocusLock noFocusGuards>
            <button className="action2">button-action</button>
            <button>6-action3</button>
            <button>6-action4</button>
          </FocusLock>
        </div>, mountPoint);
        expect(document.activeElement.innerHTML).to.be.equal('button-action');
        setTimeout(() => {
          wrapper.find('.action1').simulate('focus');
          wrapper.find('.action1').getDOMNode().focus();
          expect(document.activeElement.innerHTML).to.be.equal('action1');
          wrapper.find('.action2').simulate('blur');
          setTimeout(() => {
            expect(document.activeElement.innerHTML).to.be.equal('6-action4');
            done();
          }, 10);
        }, 1);
      });
    });
  });
});
