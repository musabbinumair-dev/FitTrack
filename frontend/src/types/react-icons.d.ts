import * as React from 'react';
import 'react-icons';

declare module 'react-icons' {
  export interface IconBaseProps extends React.SVGAttributes<SVGElement> {
    size?: string | number;
    color?: string;
    title?: string;
    className?: string;
  }
}
