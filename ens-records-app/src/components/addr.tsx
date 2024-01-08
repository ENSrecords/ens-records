

function Addr(props: { addr: string }) {
  return (
    <span className="addr">
      {props.addr.slice(0, 6)}...{props.addr.slice(-4)}
    </span>
  );
}