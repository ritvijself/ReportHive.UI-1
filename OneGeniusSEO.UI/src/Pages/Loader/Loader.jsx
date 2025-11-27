import style from "./Loader.module.css";

const Loader = () => {
  return (
    <div className={style.loaderContainer}>
      <div className={style.spinner}></div>
      <p className={style.acquiringText}>Acquiring...</p>
    </div>
  );
};

export default Loader;
