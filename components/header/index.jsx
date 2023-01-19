import { useSelector } from 'react-redux';
import SignInSighOut from '../inputs/login-btn';

export default function Header() {
  const { cart } = useSelector((state) => ({ ...state }));
  return (
    <header>
      <h1>next header</h1>
      <ul>
        <li>
          <span>Cart</span> <span>{cart.length}</span>
        </li>
        <li>
          <SignInSighOut />
        </li>
      </ul>
    </header>
  );
}
