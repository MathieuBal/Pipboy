import {Component,useEffect,type ReactNode} from 'react';
export class StartupBoundary extends Component<{children:ReactNode},{failed:boolean}>{
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true}}
 componentDidCatch(error:Error){window.dispatchEvent(new CustomEvent('pipboy:failed',{detail:error.message}))}
 render(){return this.state.failed?null:this.props.children}
}
export function Ready({children}:{children:ReactNode}){
 useEffect(()=>{window.dispatchEvent(new Event('pipboy:ready'))},[]);
 return children;
}
