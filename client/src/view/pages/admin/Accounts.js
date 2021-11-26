import React from 'react';
import axios from 'axios';
import uniqid from 'uniqid';
import debounce from 'lodash.debounce';

import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useSnackbar } from 'notistack';

import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';

import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';

const Item = props => {
	const [status, setStatus] = React.useState( props.status === 'activated' ? true : false );

	const handleStatus = e => {
		setStatus( e.target.checked );
		debouncedChangeStatus( e );
	}

	const changeStatus = async e => {
		axios.put('http://localhost:3000/change-user-status', { 
			username: props.username, 
			status: e.target.checked ? 'activated' : 'deactivated' 
		})
		.then(() => props.fetchAccounts())
		.catch( err => {
			setTimeout(() => changeStatus(), 5000);
		});
	}

	const debouncedChangeStatus = debounce(changeStatus, 500);
	const displayRole = userRole => userRole === 'sysadmin' ? 'SYSTEM ADMINISTRATOR' : 'ADMINISTRATOR STAFF';

	return(
		<>
			<div id="account-item" style={{ width: '100%' }} className="rounded item" onDoubleClick ={() => props.onDoubleClick ({ editingMode: true, ...props })}>
				<Paper elevation={2} sx={{ backgroundColor: 'rgba(0, 0, 0, 0.1)' }}>
					<Stack 
						direction="row" 
						justifyContent="space-around" 
						alignItems="center" 
						spacing={4}
						sx={{ display: 'flex' }}
					>
						<div className="col-3">
							<p className="p-0 m-0"> { props.username } </p>
						</div>

						<div className="col-4">
							<p className="p-0 m-0"> { displayRole(props.role) } </p>
						</div>

						<div className="col-3">
							<FormControlLabel 
								control={<Switch checked={status} onChange={handleStatus}/>} 
								label={ status ? 'Activated' : 'Deactivated' }
							/>
						</div>
					</Stack>
				</Paper>
			</div>
		</>
	);
}

const Accounts = props => {
	const [accounts, setAccounts] = React.useState( [] );
	const [items, setItems] = React.useState( [] );
	const [addForm, setAddForm] = React.useState( false );
	const [selectedItem, setSelectedItem] = React.useState( null );
	const { enqueueSnackbar } = useSnackbar();

	const fetchAccounts = async () => {
		axios.get('http://localhost:3000/accounts/admin')
		.then( res => {
			setAccounts( res.data );
		})
		.catch( err => {
			setTimeout(() => fetchAccounts(), 5000);
		});
	}

	React.useEffect(() => fetchAccounts(), []);

	React.useEffect(() => {
		let renderedItem = [];

		accounts.forEach( acc => {
			renderedItem.push( 
				<Item 
					key={uniqid()} 
					onDoubleClick ={handleEditForm} 
					fetchAccounts={fetchAccounts}
					{...acc}
				/> 
			);
		});

		setItems([...renderedItem]);
	}, [accounts]);

	const handleAddForm = async () => {
		setAddForm( addForm => !addForm );
	}

	const handleEditForm = async item => {
		setAddForm( addForm => !addForm );
		setSelectedItem( item );
	}

	React.useEffect(() => {
		if( !addForm ) setSelectedItem( null );
	}, [addForm]);

	return(
		<div style={{ width: '100%', height: '80vh' }} className="p-3 text-center">
			<Paper 
				elevation={3} 
				sx={{ 
					backgroundColor: 'rgba(0, 0, 0, 0.8)', 
					color: 'white',
					width: '100%', 
					height: '50px', 
					padding: '10px',
					marginBottom: '10px',
				}}
			>
				<Stack
					direction="row" 
					divider={
						<Divider 
							sx={{ width: 2, alignSelf: 'stretch', height: '30px !important' }} 
							orientation="vertical" 
							flexItem 
						/>
					} 
					spacing={3}
					justifyContent="space-around"
					alignItems="center"
				>	
					<div className="col-3">
						<Typography variant="h6">
							Name
						</Typography>
					</div>
					<div className="col-4">
						<Typography variant="h6">
							Role
						</Typography>
					</div>
					<div className="col-3">
						<Typography variant="h6">
							Status
						</Typography>
					</div>
				</Stack>
			</Paper>
			<div style={{ width: '100%', height: '90%', overflowY: 'auto' }}>
				<Stack spacing={1}>
					{ items }
				</Stack>
			</div>
			<AddUser 
				open={addForm} 
				setOpen={handleAddForm}
				setEdit={handleEditForm} 
				fetchAccounts={fetchAccounts} 
				{ ...selectedItem }
			/>
			<div style={{ position: 'absolute', bottom: '15px', right: '15px' }}>
				<IconButton style={{ backgroundColor: 'rgba(25, 25, 21, 0.9)' }} onClick={handleAddForm}>
					<AddIcon style={{ color: 'white' }}/>
				</IconButton>
			</div>
		</div>
	);
}

const AddUser = props => {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

	const [id, setID] = React.useState( null );
	const [username, setUsername] = React.useState( props.username ?? '' );
	const [email, setEmail] = React.useState( props.email ?? '' );
	const [password, setPassword] = React.useState( props.password ?? '' );
	const [role, setRole] = React.useState( props.role ?? 'sysadmin' );
	const [status, setStatus] = React.useState( props.status ?? 'activated' );

	const { enqueueSnackbar } = useSnackbar();

	const handleName = async e => {
		setUsername( e.target.value );
	}

	const handleEmail = async e => {
		setEmail( e.target.value );
	}

	const handlePassword = async e => {
		setPassword( e.target.value );
	}

	const handleRole = async e => {
		setRole( e.target.value );
	}

	React.useEffect(() => {
		if( props.editingMode ){
			setID( props._id );
			setUsername( props.username );
			setPassword( props.password );
			setEmail( props.email );
			setRole( props.role );
			setStatus( props.status );
		}
		else{
			setID( null );
			setUsername( '' );
			setPassword( '' );
			setEmail( '' );
			setRole( 'sysadmin' );
			setStatus( 'activated' );	
		}
	}, [props]);

	return(
		<div>
			<Dialog
				fullScreen={fullScreen}
				open={props.open}
				onClose={ props.setOpen }
				maxWidth="md"
				aria-labelledby="responsive-dialog-title"
			>
				<DialogTitle id="responsive-dialog-title">
					{
						!props.editingMode
							? "Want to add a system administrator or an administrator staff?"
							: "Edit this account?"
					}
				</DialogTitle>
				<DialogContent>
					<DialogContentText>
						Please fill up this form.
					</DialogContentText>
					<Box
						component="form"
						sx={{
							'& > :not(style)': { m: 1, width: '500px' },
						}}
						noValidate
						autoComplete="off"
				    >	
				    	<Stack spacing={3}>
				    		<GenerateInputFields
		    					username={username ?? ''}
		    					password={password ?? ''}
		    					email={email ?? ''}
		    					role={role ?? 'sysadmin'}
	    						handleName={handleName}
	    						handleEmail={handleEmail}
	    						handlePassword={handlePassword}
	    						handleRole={handleRole}
	    					/>
				    	</Stack>
				    </Box>
				</DialogContent>
				<DialogActions>
					<Button autoFocus onClick={ props.setOpen }>
						Discard
					</Button>
					{
						!props.editingMode
							? (
									<Button 
										autoFocus
										onClick={() => {
											axios.post('http://localhost:3000/create-user/admin', { username, password, status, email, role })
											.then(() => {
												props.fetchAccounts();
												props.setOpen();
												enqueueSnackbar('Successfully added a user', { variant: 'success' });
											})
											.catch(() => {
												enqueueSnackbar('Please try again', { variant: 'error' });
											});
										}}
									>
										Add
									</Button>
							)
							: (
								<>
									<Button 
										autoFocus
										onClick={() => {
											axios.delete(`http://localhost:3000/delete-user/${ username }`)
											.then(() => {
												props.fetchAccounts();
												props.setOpen();
												enqueueSnackbar('Successfully deleted a user', { variant: 'success' });
											})
											.catch(() => {
												enqueueSnackbar('Please try again', { variant: 'error' });
											});
										}}
									>
										Delete
									</Button>
									<Button 
										autoFocus
										onClick={() => {
											axios.post('http://localhost:3000/edit-user/admin', { id, username, password, status, email, role })
											.then(() => {
												props.fetchAccounts();
												props.setOpen();
												enqueueSnackbar('Successfully edited a user', { variant: 'success' });
											})
											.catch(() => {
												enqueueSnackbar('Please try again', { variant: 'error' });
											});
										}}
									>
										Save
									</Button>		
								</>
							)
					}
				</DialogActions>
			</Dialog>
	    </div>
	);
}


const GenerateInputFields = props => (
	<>
		<TextField 
			id="outlined-basic" 
			label="Username" 
			variant="outlined"
			value={props.username}
			onChange={props.handleName}
		/>
		<TextField 
			id="outlined-basic" 
			label="Email" 
			variant="outlined"
			value={props.email}
			onChange={props.handleEmail}
		/>
		<TextField 
			id="outlined-basic" 
			label="password" 
			variant="outlined"
			value={props.password}
			onChange={props.handlePassword}
		/>
		<FormControl fullWidth>
		  <InputLabel id="demo-simple-select-label">ROLE</InputLabel>
		  <Select
		    labelId="demo-simple-select-label"
		    id="demo-simple-select"
		    value={props.role}
		    label="ROLE"
		    onChange={props.handleRole}
		  >
		    <MenuItem sx={{ display: 'block !important' }} value={"sysadmin"}>System Administrator</MenuItem>
		    <MenuItem sx={{ display: 'block !important' }} value={"adminstaff"}>Administrator Staff</MenuItem>
		  </Select>
		</FormControl>
	</>
)

export default Accounts;