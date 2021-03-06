/** @jsx jsx */

import * as React from "react";
import {css, jsx} from "@emotion/core";
import { AppState } from "../app-state/AppState";
import { HardeenHandle } from '../../../hardeen_wasm/pkg';
import { autorun } from "mobx";
import { observer } from "mobx-react";

interface AttributeProps {
    label: string,
    valueType: string,
    value: string,
    onChange: Function,
    appState: AppState
}

interface AttributeState {
    inputValue: string
}

class Attribute extends React.PureComponent<AttributeProps,AttributeState> {

    constructor(props: AttributeProps) {
        super(props);

        this.state = {
            inputValue: props.value
        };
    }

    componentDidMount( ) {
        this.state = {
            inputValue: this.props.value
        }
    }

    componentDidUpdate(prevProps: AttributeProps, prevState: AttributeState) {
        if(this.props.value !== prevProps.value) {
            this.setState({
                inputValue: this.props.value
            })
        }
    }

    render() {

        let inputComponent : JSX.Element = <div></div>;

        switch(this.props.valueType) {
            case "bool": {
                inputComponent = this.renderBoolean();
                break;
            }
            case "f32": {
                inputComponent = this.renderF32();
                break;
            }
            case "u32": {
                inputComponent = this.renderU32();
                break;
            }
            case "i32": {
                inputComponent = this.renderI32();
                break;
            }
            case "String": {
                inputComponent = this.renderString();
                break;
            }
            case "Position": {
                inputComponent = this.renderPosition();
                break;
            }
            case "PositionList": {
                inputComponent = this.renderPositionList();
                break;
            }
        }

        return <div>
            <label>
                {this.props.label}:
                {
                    inputComponent
                }
            </label>
        </div>
    }

    renderF32() {
        return <input type="text" name={this.props.label} value={this.state.inputValue} onChange={this.handleFloatInput}
        onFocus={ (event) => { this.props.appState.inputFocused = true; }} onBlur={ () => { this.props.appState.inputFocused=false; } } />
    }

    renderU32() {
        return <input type="text" name={this.props.label} value={this.state.inputValue} onChange={this.handleFloatInput}
        onFocus={ (event) => { this.props.appState.inputFocused = true; }} onBlur={ () => { this.props.appState.inputFocused=false; } } />
    }

    renderI32() {
        return <input type="text" name={this.props.label} value={this.state.inputValue} onChange={this.handleFloatInput}
        onFocus={ (event) => { this.props.appState.inputFocused = true; }} onBlur={ () => { this.props.appState.inputFocused=false; } } />
    }

    renderString() {
        return <input type="text" name={this.props.label} value={this.state.inputValue} onChange={this.handleFloatInput}
        onFocus={ (event) => { this.props.appState.inputFocused = true; }} onBlur={ () => { this.props.appState.inputFocused=false; } } />
    }

    renderBoolean() {
        return <input type="checkbox" name={this.props.label} checked={this.state.inputValue=="true" ? true : false} onChange={this.handleBooleanInput}
        onFocus={ (event) => { this.props.appState.inputFocused = true; }} onBlur={ () => { this.props.appState.inputFocused=false; } } />
    }

    renderPosition() {
        return <input type="text" name={this.props.label} value={this.state.inputValue} onChange={this.handleFloatInput}
        onFocus={ (event) => { this.props.appState.inputFocused = true; }} onBlur={ () => { this.props.appState.inputFocused=false; } } />
    }

    renderPositionList() {
        return <input type="text" name={this.props.label} value={this.state.inputValue} onChange={this.handlePositionListInput} 
        onFocus={ (event) => { this.props.appState.inputFocused = true; }} onBlur={ () => { this.props.appState.inputFocused=false; } } />
    }

    handleFloatInput = (event: React.FormEvent<HTMLInputElement>) => {

        event.stopPropagation();

        const value = event.currentTarget.value;

        if(!event.currentTarget.validity.valid) {
            return;
        }

        this.setState({
            inputValue: value
        });

        this.props.onChange(value.trim());
    }

    handlePositionListInput = (event: React.FormEvent<HTMLInputElement>) => {

        event.stopPropagation();

        const value = event.currentTarget.value;

        this.setState({
            inputValue: value
        });

        let tmp = value.split(';');
        for(let i=0; i < tmp.length; i++) {
            let coords = tmp[i].split(',');
            if(coords.length !== 2 ) return;
            if(coords[1] == "") return;
        }

        this.props.onChange(value);
    }

    handleBooleanInput = (event: React.FormEvent<HTMLInputElement>) => {

        const value = event.currentTarget.checked ? "true" : "false";
        this.setState({
            inputValue: value
        });

        this.props.onChange(value);
    }

}

interface PropertyEditorState {
    selectedNode : HardeenHandle,
    disposer: Function,
    dirty: { [key: string]: string }
}

interface PropertyEditorProps {
    appState: AppState
}

class PropertyEditor extends React.Component<PropertyEditorProps, PropertyEditorState> {

    constructor(props: PropertyEditorProps) {
        super(props);

        this.state = {
            selectedNode: null,
            disposer: null,
            dirty: {}
        };

    }

    updateSelectedNode = () => {
        this.setState({
            selectedNode: this.props.appState.selectedNode
        });
    }

    componentDidMount = () => {
        const disposer = autorun( this.updateSelectedNode );

        this.setState({
            disposer
        });
    }

    componentWillUnmount = () => {
        this.state.disposer();
        this.setState({
            disposer: null,
            dirty: {}
        });
    }

    render() {

        const editorStyle = css`
            position: absolute;
            left: 0;
            bottom: 0;
            border: 1px solid grey;
            padding: 2rem;
            background-color: #444444;
            color: white;
        `;

        if(this.state.selectedNode==null) {
            return <div></div>    
        }

        const nodeType = this.props.appState.nodeType[this.state.selectedNode.get_node_type()];
        const nodeHandle = this.state.selectedNode;
    
        const hc = this.props.appState.hardeenCore;
        const graphPath = this.props.appState.currentGraphPath;
        
        return <div css={editorStyle}>
            <h2>{nodeType.name}</h2>
            {
                nodeType.parameters.map( (p) => {
                    const value = hc.get_node_parameter(graphPath,nodeHandle, p.param_name);
                    return <Attribute appState={this.props.appState} key={p.param_name} label={p.param_name} value={value} valueType={p.param_type} onChange={ (newValue: string) => {
                        this.setState( (oldState) => {
                            oldState.dirty[p.param_name] = newValue;
                            return {
                                dirty: oldState.dirty
                            }
                        });
                    } }/>;
                } )
            }
            <button onClick={ () => {
                Object.keys(this.state.dirty).forEach(paramName => {
                    hc.set_node_parameter(graphPath,nodeHandle, paramName, this.state.dirty[paramName]);
                    console.log(paramName+" => "+this.state.dirty[paramName]);
                } );
                this.setState({
                    dirty: {}
                });

                if(hc.is_input_satisfied(graphPath,nodeHandle)) {
                    this.props.appState.messenger.send({type: "RunProcessors"});
                }
            }}>Update</button>
        </div>
    }
}

export default observer(PropertyEditor);