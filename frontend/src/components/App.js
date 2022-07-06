import React, { useState, useEffect } from 'react';
import { Route, Switch, Redirect, useHistory, withRouter } from 'react-router-dom';
import Header from './Header.js';
import Main from './Main.js';
import PopupWithForm from './PopupWithForm.js';
import ImagePopup from './ImagePopup.js';
import EditProfilePopup from './EditProfilePopup.js';
import EditAvatarPopup from './EditAvatarPopup.js';
import AddPlacePopup from './AddPlacePopup.js';
import Footer from './Footer.js';
import api from '../utils/Api.js';
import ProtectedRoute from './ProtectedRoute.js';
import Login from './Login.js';
import Register from './Register.js';
import InfoTooltip from './InfoTooltip.js';
import successImage from '../images/success.svg';
import errorImage from '../images/error.svg';
import * as auth from '../auth.js';
import { CurrentUserContext } from '../contexts/CurrentUserContext.js';

function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] = useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] = useState(false);
  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);
  const [infoTooltipImage, setInfoTooltipImage] = useState(successImage);
  const [infoTooltipMessage, setInfoTooltipMessage] = useState('');
  const [selectedCard, setSelectedCard] = useState(null);
  const [currentUser, setCurrentUser] = useState({});
  const [cards, setCards] = useState([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const history = useHistory();

  useEffect(() => {
    tokenCheck();
    Promise.all([api.getUserInfo(), api.getInitialCards()])
      .then(([userData, items]) => {
        setCurrentUser(userData);
        setCards(items);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [])

  function tokenCheck() {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      auth.getContent(jwt).then((res) => {
        if (res) {
          setLoggedIn(true);
          setEmail(res.data.email);
          history.push('/');
        }
      })
        .catch((err) => {
          console.log(err);
        });
    }
  }

  function signOut() {
    localStorage.removeItem('jwt');
    history.push('/sign-in');
  }

  function handleLogin() {
    setLoggedIn(true);
  }

  function handleLoginSubmit(e) {
    e.preventDefault();
    if (!this.state.email || !this.state.password) {
      return;
    }
    auth.authorize(this.state.password, this.state.email)
      .then((data) => {
        if (data.token) {
          this.setState({
            email: '',
            password: ''
          }, () => {
            this.props.handleLogin();
            this.props.history.push('/');
          })
        }
      })
      .catch(err => console.log(err));
  }

  function handleRegisterSubmit(e) {
    e.preventDefault();
    const { password, email } = this.state;
    auth.register(password, email).then((res) => {
      if (res) {
        setIsInfoTooltipOpen(true);
        setInfoTooltipImage(successImage);
        setInfoTooltipMessage('Вы успешно зарегистрировались!');
      }
    }
    )
      .catch(() => {
        setIsInfoTooltipOpen(true);
        setInfoTooltipImage(errorImage);
        setInfoTooltipMessage('Что-то пошло не так! Попробуйте ещё раз.');
      });
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some(i => i._id === currentUser._id);
    api.changeLikeCardStatus(card._id, isLiked).then((newCard) => {
      setCards((cards) => cards.map((c) => c._id === card._id ? newCard : c));
    })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleCardDelete(card) {
    api.deleteCard(card._id).then(() => {
      setCards((cards) => cards.filter((c) => c._id !== card._id));
    })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }
  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsInfoTooltipOpen(false);
    setSelectedCard(null);
  }

  function closeInfoTooltip() {
    closeAllPopups();
    if (infoTooltipImage === successImage) {
      history.push('/sign-in');
    }
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleUpdateUser({ name, about }) {
    api.setUserInfo({ name, about })
      .then(res => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleUpdateAvatar(url) {
    api.setUserAvatar(url)
      .then(res => {
        setCurrentUser(res);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  function handleAddPlaceSubmit({ name, link }) {
    api.addNewCard({ name, link })
      .then(newCard => {
        setCards([newCard, ...cards]);
        closeAllPopups();
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return (
    <CurrentUserContext.Provider value={currentUser}>
      <Switch>
        <ProtectedRoute exact path="/"
          loggedIn={loggedIn}
          component={() => {
            return (
              <div className="App">
                <Header loggedIn={loggedIn} onClick={signOut} email={email} />
                <Main onEditProfile={handleEditProfileClick} onAddPlace={handleAddPlaceClick} onEditAvatar={handleEditAvatarClick}
                  onCardClick={handleCardClick} cards={cards} onCardLike={handleCardLike} onCardDelete={handleCardDelete} />
                <EditProfilePopup isOpen={isEditProfilePopupOpen} onClose={closeAllPopups} onUpdateUser={handleUpdateUser} />
                <AddPlacePopup isOpen={isAddPlacePopupOpen} onClose={closeAllPopups} onAddPlace={handleAddPlaceSubmit} />
                <ImagePopup card={selectedCard} onClose={closeAllPopups} />
                <PopupWithForm title="Вы уверены?" id="confirm" buttonText="Да" />
                <EditAvatarPopup isOpen={isEditAvatarPopupOpen} onClose={closeAllPopups} onUpdateAvatar={handleUpdateAvatar} />
                <Footer />
              </div>
            )
          }
          } />
        <Route path="/sign-in">
          <Login handleLogin={handleLogin} handleSubmit={handleLoginSubmit} />
        </Route>
        <Route path="/sign-up">
          <Register handleSubmit={handleRegisterSubmit} />
          <InfoTooltip isOpen={isInfoTooltipOpen} message={infoTooltipMessage}
            image={infoTooltipImage} onClose={closeInfoTooltip} />
        </Route>
        <Route>
          {loggedIn ? <Redirect to="/" /> : <Redirect to="/sign-in" />}
        </Route>
      </Switch>
    </CurrentUserContext.Provider>
  );
}

export default withRouter(App);
