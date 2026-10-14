import {
	createContext,
	useCallback,
	useContext,
	useMemo,
	useState,
} from "react";
import { ContactDialog } from "./ContactDialog";

interface ContactContextValue {
	/** Opens the contact dialog. */
	open: () => void;
}

// Outside a provider, opening does nothing, so a component can render anywhere.
const ContactContext = createContext<ContactContextValue>({ open: () => {} });

export function useContact(): ContactContextValue {
	return useContext(ContactContext);
}

/** Holds the one contact dialog, so any button on any page can open it. */
export function ContactProvider({
	children,
}: {
	children: React.ReactNode;
}): React.JSX.Element {
	const [isOpen, setIsOpen] = useState(false);
	const open = useCallback(() => setIsOpen(true), []);
	const close = useCallback(() => setIsOpen(false), []);
	const value = useMemo(() => ({ open }), [open]);

	return (
		<ContactContext value={value}>
			{children}
			{isOpen && <ContactDialog onClose={close} />}
		</ContactContext>
	);
}
