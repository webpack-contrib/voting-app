import React from 'react';
import VoteButton from 'Components/button/button';
import './topic-style';

// Specify BEM block name
const block = 'topic';

export default class Topic extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            editable: false,
            title: props.topic.title,
            description: props.topic.description
        };
    }
    
    render() {
        let { user, admin, topic, votes, token } = this.props,
            { editable, title, description } = this.state;

        return (
            <div className={ block }>
                <section className={ `${block}__content` }>
                    <div className={ `${block}__title` }>
                        { !editable ? title : (
                            <input 
                                type="text" 
                                value={ title } 
                                onChange={ this._changeTitle.bind(this) } />
                        )}
                        {/* admin ? (
                            // TODO: Separate component to handle dropdown and state?
                            <div className={ `${block}__settings` }>
                                <button onClick={ 
                                    this._changeSettings.bind(this, { locked: true }) 
                                }>
                                    Lock
                                </button>

                                <button onClick={
                                    this._changeSettings.bind(this, { locked: false })
                                }>
                                    Unlock
                                </button>

                                <button onClick={
                                    this._changeSettings.bind(this, { archived: true })
                                }>
                                    Archive
                                </button>

                                <button onClick={
                                    this._changeSettings.bind(this, { archived: false })
                                }>
                                    Unarchive
                                </button>

                                <button onClick={ this._edit.bind(this) }>
                                    Edit
                                </button>
                            </div> 
                        ) : null */}
                    </div>
                    <div className={ `${block}__inner` }>
                        <div className={ `${block}__description` }>
                            { !editable ? description : (
                                <textarea 
                                    value={ description } 
                                    onChange={ this._changeDescription.bind(this) } />
                            )}
                        </div>

                        <div className={ `${block}__sponsors` }>
                            <div><b>Sponsors</b></div>
                            <p>Coming soon...</p>
                        </div>
                    </div>
                </section>

                <section className={ `${block}__vote` }>
                    <div className={ `${block}__title ${block}__title--vote` }>
                        Place Your Vote
                    </div>
                    <div className={ `${block}__inner` }>
                        { votes.map((settings, i) => {
                            let { minimum = 0, maximum = 1000 } = settings,
                                vote = topic.votes[i],
                                userVote = topic.userVotes ? topic.userVotes[i] : null,
                                currency = user ? user.currencies.find(currency => currency.name === settings.currency) : null,
                                value = (userVote && userVote.votes) ? userVote.votes : 0;

                            if (currency && currency.remaining + value < maximum) {
                                maximum = currency.remaining + value;
                            }

                            return (
                                <div key={ settings.name } className={ `${block}__field` }>
                                    <VoteButton
                                        className={ `${block}__field` }
                                        value={ vote.votes }
                                        myValue={ value }
                                        maxUp={ userVote ? maximum - value : 0 }
                                        maxDown={ userVote ? value - minimum : 0 }
                                        color={ this._getInfluenceColor(settings.name) }
                                        canVote = { !!user && !topic.locked }
                                        onVote={ this._vote.bind(this, settings) } />
                                </div>
                            );
                        })}
                        <div className={ `${block}__total` }>
                            { topic.score }
                        </div>
                    </div>
                </section>
                {/* editable ? (
                    <button onClick={ this._saveChanges.bind(this) }>
                        Done Editing
                    </button>
                ) : null }*/}
            </div>
        );
    }

    /**
     * Get color for the given influence [name]
     * 
     * @param {string} name - Infuence type
     * @return {string} - A valid CSS color value
     */
    _getInfluenceColor(name) {
        switch (name) {
            case 'influence': return 'blue';
            case 'golden': return '#bfa203';
            case 'thumb': return '#535353';
            default: return undefined;
        }
    }

    /**
     * Trigger voting process
     *
     * @param {object} settings   - Data describing the type of vote
     * @param {number} difference - Amount to change influence
     */
    _vote(settings = {}, difference) {
        let { topic } = this.props;

        this.props.onVote(
            topic.id, 
            settings.name, 
            difference, 
            settings.currency, 
            settings.score
        );
    }

    /**
     * Enable topic editing
     * 
     * @param {object} e - React synthetic event
     */
    _edit(e) {
        // TODO: Set isCreating in Wrapper via a this.props.edit callback?
        this.setState({
            editable: true
        });
    }

    /**
     * Update the topic's title
     * 
     * @param  {object} e - React synthetic event
     */
    _changeTitle(e) {
        this.setState({ 
            title: e.target.value 
        });
    }

    /**
     * Update the topic's description
     * 
     * @param {object} e - React synthetic event
     */
    _changeDescription(e) {
        this.setState({ 
            description: e.target.value 
        });
    }

    /**
     * Update topic settings
     * 
     * @param {object} settings - 
     */
    _changeSettings(settings = {}) {
        let { topic } = this.props;

        this.props.onSettingsChange(topic.id, settings);
    }

    /**
     * Pass changes up via this.props.save
     * 
     * @param {object} e - React synthetic event
     */
    _saveChanges(e) {
        let { title, description } = this.state;

        // TODO: This is one approach using promises
        this.props
            .save(title, description)
            .then(success => this.setState({
                editable: false
            }));

        // this.setState({
        //     editItem: null,
        //     isCreating: true
        // });

        // api.configItem(voteAppToken, item.id, {
        //     description: editItemDescription,
        //     title: editItemTitle
        // }).then(() => {
        //     this.setState({
        //         isCreating: false
        //     });

        //     this._updateList();
        // });
    }
}
